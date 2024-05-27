import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, StatusBar, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function FormScreen({ route, navigation }) {
    const { selectedDate, markedDates, setMarkedDates } = route.params;
    const [client, setClient] = useState('');
    const [time, setTime] = useState('');
    const [serviceType, setServiceType] = useState('');

    const onSaveAppointment = () => {
        const newMarkedDates = {
            ...markedDates,
            [selectedDate]: { marked: true, client, time, serviceType }
        };
        setMarkedDates(newMarkedDates);

        Alert.alert(
            'Sucesso',
            'Compromisso salvo com sucesso!',
            [{ text: 'OK', onPress: () => navigation.goBack() }],
            { cancelable: false }
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="red" />
            <View style={styles.formContainer}>
                <Text style={styles.label}>Data selecionada: {selectedDate}</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Cliente"
                    value={client}
                    onChangeText={(text) => setClient(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Horário"
                    value={time}
                    onChangeText={(text) => setTime(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Tipo De Serviço"
                    value={serviceType}
                    onChangeText={(text) => setServiceType(text)}
                />
                <Button title="Salvar Compromisso" onPress={onSaveAppointment} />
            </View>
        </View>
    );
}

function HomeScreen({ navigation }) {
    const [markedDates, setMarkedDates] = useState({});

    const onDayPress = (day) => {
        navigation.navigate('Form', { selectedDate: day.dateString, markedDates, setMarkedDates });
    };

    const onViewMarkedDays = () => {
        navigation.navigate('MarkedDays', { markedDates });
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
    const { markedDates } = route.params;

    const onDayPress = (date) => {
        navigation.navigate('AppointmentDetails', { date, details: markedDates[date] });
    };

    return (
        <ScrollView style={styles.container}>
            <StatusBar backgroundColor="rgb(73, 89, 94)" />
            <View style={styles.markedDaysContainer}>
                {Object.keys(markedDates).length > 0 ? (
                    Object.keys(markedDates).map((date) => (
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

function AppointmentDetailsScreen({ route }) {
    const { date, details } = route.params;

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="rgb(73, 89, 94)" />
            <View style={styles.detailsContainer}>
                <Text style={styles.detailsText}>Data: {date}</Text>
                <Text style={styles.detailsText}>Cliente: {details.client}</Text>
                <Text style={styles.detailsText}>Horário: {details.time}</Text>
                <Text style={styles.detailsText}>Tipo de Serviço: {details.serviceType}</Text>
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
