import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, StatusBar } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function FormScreen({ route, navigation }) {
    const { selectedDate } = route.params;
    const [time, setTime] = useState('');
    const [appointment, setAppointment] = useState('');

    const onSaveAppointment = () => {
        console.log('Data selecionada:', selectedDate);
        console.log('Horário:', time);
        console.log('Compromisso:', appointment);
        // Implementar lógica de salvar compromisso aqui
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="red" />
            <View style={styles.formContainer}>
                <Text>Data selecionada: {selectedDate}</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Horário"
                    value={time}
                    onChangeText={(text) => setTime(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Serviço"
                    value={appointment}
                    onChangeText={(text) => setAppointment(text)}
                />
                <Button title="Salvar Compromisso" onPress={onSaveAppointment} />
            </View>
        </View>
    );
}

function HomeScreen({ navigation }) {
    const onDayPress = (day) => {
        navigation.navigate('Form', { selectedDate: day.dateString });
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="rgb(73, 89, 94)" />
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
                    markedDates={{}}
                    firstDay={0}
                />
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
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 10,
        backgroundColor: 'rgb(23 36 34)', //cor de fundo total
    },
    calendarContainer: {
        flex: 1,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: 'rgb(11 39 71)',
        borderRadius:87,
    },
    input: {
        height: 40,
        borderColor: 'white',
        borderRadius: 38,
        borderWidth: 1,
        paddingHorizontal: 8,
        marginBottom: 12,
        padding: 1,
    },
});

export default App;
