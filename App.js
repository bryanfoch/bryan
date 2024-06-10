import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, StatusBar, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SQLite from 'expo-sqlite';
import 'react-native-gesture-handler';

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
      'CREATE TABLE IF NOT EXISTS compromissos (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT, cliente TEXT, horario TEXT, tipo_servico TEXT);',
      [],
      () => {
        console.log('Tabela compromissos criada com sucesso');
      },
      (_, error) => {
        console.error('Erro ao criar tabela compromissos', error);
      }
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, senha TEXT);',
      [],
      () => {
        console.log('Tabela usuarios criada com sucesso');
      },
      (_, error) => {
        console.error('Erro ao criar tabela usuarios', error);
      }
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

function criarUsuario(nome, senha, callback) {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO usuarios (nome, senha) VALUES (?, ?);',
      [nome, senha],
      (_, result) => {
        callback(result);
      },
      (_, error) => {
        console.error(error);
      }
    );
  });
}

function verificarUsuario(nome, senha, callback) {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM usuarios WHERE nome = ? AND senha = ?;',
      [nome, senha],
      (_, { rows: { _array } }) => {
        callback(_array.length > 0);
      },
      (_, error) => {
        console.error(error);
      }
    );
  });
}

function LoginScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = () => {
    if (!nome || !senha) {
      Alert.alert('Erro', 'Por favor, insira o nome e a senha ou faça um novo registro para continuar.');
      return;
    }
    verificarUsuario(nome, senha, isValid => {
      if (isValid) {
        navigation.navigate('Home');
      } else {
        Alert.alert('Erro', 'Nome de usuário ou senha incorretos.');
      }
    });
  };

  const handleRegister = () => {
    criarUsuario(nome, senha, () => {
      Alert.alert('Sucesso', 'Usuário registrado com sucesso!');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="red" />
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
        <View style={styles.buttonContainer}>
          <Button title="Login" onPress={handleLogin} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Registrar" onPress={handleRegister} />
        </View>
      </View>
    </View>
  );
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
        <View style={styles.buttonContainer}>
          <Button title={isEdit ? "Atualizar Compromisso" : "Salvar Compromisso"} onPress={onSaveAppointment} />
        </View>
      </View>
    </View>
  );
}

function HomeScreen({ navigation }) {
  const [markedDates, setMarkedDates] = useState({});
  const [brasiliaTime, setBrasiliaTime] = useState('');

  const refreshData = () => {
    recuperarCompromissos(compromissos => {
      const dates = {};
      compromissos.forEach(c => {
        dates[c.data] = { marked: true, dotColor: 'blue', ...c };
      });
      setMarkedDates(dates);
    });
  };

  useEffect(() => {
    initializeDatabase();
    refreshData();
  }, []);

  useEffect(() => {
    const updateBrasiliaTime = () => {
      const now = new Date();
      const options = { timeZone: 'America/Sao_Paulo', weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      const timeString = now.toLocaleTimeString('pt-BR', options);
      setBrasiliaTime(timeString);
    };

    updateBrasiliaTime(); 
    const intervalId = setInterval(updateBrasiliaTime, 1000); 

    return () => clearInterval(intervalId); 
  }, []);

  const handleDayPress = day => {
    navigation.navigate('FormScreen', { selectedDate: day.dateString, refreshData });
  };

  const handleMarkedDaysPress = () => {
    navigation.navigate('MarkedDaysScreen', { markedDates, refreshData });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="red" />
      <Text style={styles.instructionText}>Por favor, escolha um dia do calendário para adicionar um compromisso.</Text>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        markingType={'simple'}
      />
      <TouchableOpacity style={styles.markedDaysButton} onPress={handleMarkedDaysPress}>
        <Text style={styles.markedDaysButtonText}>Compromissos Marcados</Text>
      </TouchableOpacity>
      <Text style={styles.brasiliaTime}>{brasiliaTime}</Text>
    </View>
  );
}

function MarkedDaysScreen({ route, navigation }) {
  const { markedDates, refreshData } = route.params;

  const onDayPress = date => {
    const compromisso = markedDates[date];
    if (compromisso) {
      navigation.navigate('AppointmentDetails', { date, details: compromisso, refreshData });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.markedDaysContainer}>
        {Object.keys(markedDates).length ? (
          Object.keys(markedDates).map(date => (
            <TouchableOpacity key={date} onPress={() => onDayPress(date)}>
              <Text style={styles.markedDayText}>{date}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.markedDayText}>Nenhum compromisso marcado.</Text>
        )}
      </View>
    </ScrollView>
  );
}

function AppointmentDetailsScreen({ route, navigation }) {
  const { date, details, refreshData } = route.params;

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza de que deseja excluir este compromisso?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: () => {
            deletarCompromisso(details.id, () => {
              refreshData();
              navigation.goBack();
            });
          },
          style: 'destructive'
        }
      ],
      { cancelable: false }
    );
  };

  const handleEdit = () => {
    navigation.navigate('FormScreen', { selectedDate: date, compromisso: details, isEdit: true, refreshData });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="red" />
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsText}>Data: {date}</Text>
        <Text style={styles.detailsText}>Cliente: {details.cliente}</Text>
        <Text style={styles.detailsText}>Horário: {details.horario}</Text>
        <Text style={styles.detailsText}>Tipo de Serviço: {details.tipo_servico}</Text>
        <View style={styles.buttonContainer}>
          <Button title="Editar" onPress={handleEdit} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Excluir" onPress={handleDelete} />
        </View>
      </View>
    </View>
  );
}

function App() {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Agenda' }} />
        <Stack.Screen name="FormScreen" component={FormScreen} options={{ title: 'Novo Compromisso' }} />
        <Stack.Screen name="MarkedDaysScreen" component={MarkedDaysScreen} options={{ title: 'Compromissos Marcados' }} />
        <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} options={{ title: 'Detalhes do Compromisso' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    marginVertical: 5, // Adiciona espaçamento vertical entre os botões
  },
  markedDaysButton: {
    backgroundColor: '#4682b4',
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  markedDaysButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  markedDaysContainer: {
    marginTop: 20,
  },
  markedDayText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  detailsText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  brasiliaTime: {
    marginTop: 245,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffc160',
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#8c95c2',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default App;
