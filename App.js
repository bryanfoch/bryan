import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, StatusBar, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SQLite from 'expo-sqlite';

// Configuração da localização para português
LocaleConfig.locales['pt'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt';

const db = SQLite.openDatabase('compromissos.db');
const Stack = createStackNavigator();

function initializeDatabase() {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS compromissos (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT, cliente TEXT, horario TEXT, tipo_servico TEXT);'
    );
  });
}

function salvarCompromisso(data, cliente, horario, tipoServico, callback) {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO compromissos (data, cliente, horario, tipo_servico) values (?, ?, ?, ?);',
      [data, cliente, horario, tipoServico],
      (_, result) => {
        callback(result);
      },
      (_, error) => {
        console.error(error);
      }
    );
  });
}

function recuperarCompromissos(callback) {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM compromissos;',
      [],
      (_, { rows: { _array } }) => {
        callback(_array);
      },
      (_, error) => {
        console.error(error);
      }
    );
  });
}

function deletarCompromisso(id, callback) {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM compromissos WHERE id = ?;',
      [id],
      (_, result) => {
        callback(result);
      },
      (_, error) => {
        console.error(error);
      }
    );
  });
}

function atualizarCompromisso(id, data, cliente, horario, tipoServico, callback) {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE compromissos SET data = ?, cliente = ?, horario = ?, tipo_servico = ? WHERE id = ?;',
      [data, cliente, horario, tipoServico, id],
      (_, result) => {
        callback(result);
      },
      (_, error) => {
        console.error(error);
      }
    );
  });
}

function FormScreen({ route, navigation }) {
  const { selectedDate, refreshData, compromisso, isEdit } = route.params;
  const [cliente, setCliente] = useState(compromisso?.cliente || '');
  const [horario, setHorario] = useState(compromisso?.horario || '');
  const [tipoServico, setTipoServico] = useState(compromisso?.tipoServico || '');

  const onSaveAppointment = () => {
    if (isEdit) {
      atualizarCompromisso(compromisso.id, selectedDate, cliente, horario, tipoServico, () => {
        Alert.alert(
          'Sucesso',
          'Compromisso atualizado com sucesso!',
          [{ text: 'OK', onPress: () => {
            refreshData();
            navigation.goBack();
          } }],
          { cancelable: false }
        );
      });
    } else {
      salvarCompromisso(selectedDate, cliente, horario, tipoServico, () => {
        Alert.alert(
          'Sucesso',
          'Compromisso salvo com sucesso!',
          [{ text: 'OK', onPress: () => {
            refreshData();
            navigation.goBack();
          } }],
          { cancelable: false }
        );
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="red" />
      <View style={styles.formContainer}>
        <Text style={styles.label}>Data selecionada: {selectedDate}</Text>
        <TextInput
          style={styles.input}
          placeholder="Cliente"
          value={cliente}
          onChangeText={setCliente}
        />
        <TextInput
          style={styles.input}
          placeholder="Horário"
          value={horario}
          onChangeText={setHorario}
        />
        <TextInput
          style={styles.input}
          placeholder="Tipo De Serviço"
          value={tipoServico}
          onChangeText={setTipoServico}
        />
        <Button title={isEdit ? "Atualizar Compromisso" : "Salvar Compromisso"} onPress={onSaveAppointment} />
      </View>
    </View>
  );
}

function HomeScreen({ navigation }) {
  const [markedDates, setMarkedDates] = useState({});

  const refreshData = () => {
    recuperarCompromissos(compromissos => {
      const newMarkedDates = compromissos.reduce((acc, { id, data, cliente, horario, tipo_servico }) => {
        acc[data] = { marked: true, id, cliente, horario, tipoServico: tipo_servico };
        return acc;
      }, {});
      setMarkedDates(newMarkedDates);
    });
  };

  useEffect(() => {
    initializeDatabase();
    refreshData();
  }, []);

  const onDayPress = day => {
    navigation.navigate('Form', { selectedDate: day.dateString, refreshData });
  };

  const onViewMarkedDays = () => {
    navigation.navigate('MarkedDays', { markedDates, refreshData });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="rgb(73, 89, 94)" />
      <Text style={styles.instructions}>Clique em um dia no calendário para adicionar um compromisso</Text>
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={onDayPress}
          theme={{
            calendarBackground: 'rgb(73, 89, 94)', // Cor de fundo do calendário
            dayTextColor: '#000000', // Cor do texto dos dias
            monthTextColor: '#000000', // Cor do texto dos meses
            arrowColor: '#000000', // Cor das setas de navegação
            textDayFontSize: 16,
            textMonthFontSize: 20,
            textDayHeaderFontSize: 14,
          }}
          markedDates={markedDates}
          firstDay={0}
        />
        <View style={styles.buttonContainer}>
          <Button title="Ver Dias Marcados" onPress={onViewMarkedDays} />
        </View>
      </View>
    </View>
  );
}

function MarkedDaysScreen({ route, navigation }) {
  const { markedDates, refreshData } = route.params;

  const onDayPress = date => {
    navigation.navigate('AppointmentDetails', { date, details: markedDates[date], refreshData });
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar backgroundColor="rgb(73, 89, 94)" />
      <View style={styles.markedDaysContainer}>
        {Object.keys(markedDates).length > 0 ? (
          Object.keys(markedDates).map(date => (
            <TouchableOpacity key={date} onPress={() => onDayPress(date)}>
              <Text style={styles.markedDayText}>{date}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.markedDayText}>Nenhum dia marcado</Text>
        )}
      </View>
    </ScrollView>
  );
}

function AppointmentDetailsScreen({ route, navigation }) {
  const { date, details, refreshData } = route.params;

  const handleDelete = () => {
    deletarCompromisso(details.id, () => {
      Alert.alert(
        'Sucesso',
        'Compromisso deletado com sucesso!',
        [{ text: 'OK', onPress: () => {
          refreshData();
          navigation.goBack();
        } }],
        { cancelable: false }
      );
    });
  };

  const handleEdit = () => {
    navigation.navigate('Form', { 
      selectedDate: date, 
      compromisso: details, 
      isEdit: true,
      refreshData
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="rgb(73, 89, 94)" />
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsText}>Data: {date}</Text>
        <Text style={styles.detailsText}>Cliente: {details.cliente}</Text>
        <Text style={styles.detailsText}>Horário: {details.horario}</Text>
        <Text style={styles.detailsText}>Tipo de Serviço: {details.tipoServico}</Text>
        <Button title="Editar" onPress={handleEdit} />
        <Button title="Deletar" onPress={handleDelete} color="red" />
      </View>
    </View>
  );
}

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Calendário' }} />
        <Stack.Screen name="Form" component={FormScreen} options={{ title: 'Adicionar Compromisso' }} />
        <Stack.Screen name="MarkedDays" component={MarkedDaysScreen} options={{ title: 'Dias Marcados' }} />
        <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} options={{ title: 'Detalhes do Compromisso' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
    backgroundColor: 'rgb(23, 36, 34)', //cor de fundo total
  },
  instructions: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  calendarContainer: {
    flex: 1,
    marginVertical: 20, // Adicionado espaçamento ao redor do calendário
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgb(11, 39, 71)',
    borderRadius: 10,
    padding: 20,
  },
  label: {
    color: 'white',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 12,
    color: 'white',
  },
  buttonContainer: {   //botão de ver dias marcados
    marginTop: 20,
    marginHorizontal: 20,
  },
  markedDaysContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markedDayText: {
    color: 'white',
    fontSize: 16,
    marginVertical: 5,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: 'rgb(11, 39, 71)',
    borderRadius: 10,
  },
  detailsText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
});

export default App;
