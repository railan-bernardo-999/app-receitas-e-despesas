import { addTransaction, getMonthlyTotals, getTransactions } from '@/database/transactions';
import { useDatabase } from '@/hooks/useDatabase';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type TableTypes = {
    id: string;
    type: string;
    value: number;
    date: string;
}

interface MonthlyTotals {
    receitas: number;
    despesas: number;
}

export default function HomeScreen() {
    const { isReady, error } = useDatabase();
    const [transactions, setTransactions] = useState<TableTypes[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [value, setValue] = useState('');
    const [selectedValue, setSelectedValue] = useState('Receita');
    const [totals, setTotals] = useState<MonthlyTotals>({ receitas: 0, despesas: 0 });


    async function loadData() {
        try {
            if (!isReady) return;
            const data: any = await getTransactions();
            setTransactions(data);
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
        }
    }

    async function loadTotals() {
        try {
            const monthlyTotals = await getMonthlyTotals();
            setTotals(monthlyTotals);
        } catch (error) {
            console.error('Erro ao carregar totais:', error);
        }
    }

    function formatDate(isoDate: string) {
        const date = new Date(isoDate);
        return date.toLocaleDateString('pt-BR');
    }


    function formatCurrency(value: number) {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    }

    async function saveTransaction() {
        if (!selectedValue || !value) {
            Alert.alert('Preencha todos os campos!');
            return;
        }

        const numericValue = Number(value.replace(',', '.'));

        if (isNaN(numericValue)) {
            Alert.alert('Valor inválido!');
            return;
        }

        try {
            await addTransaction(
                selectedValue,
                numericValue,
                new Date().toISOString()
            );
            setModalVisible(false);
            setSelectedValue('');
            setValue('');
            await loadData();
            await loadTotals();
        } catch (error: any) {
            Alert.alert('Erro ao salvar', error.message);
        }
    }


    useEffect(() => {
        if (isReady) {
            loadData();
            loadTotals();
        }
    }, [isReady]);

    return (
        <View style={styles.container}>
            <View style={[{ backgroundColor: "rgba(0,0,0,0.8)", padding: 20, backdropFilter: "blur(7px)" }]}></View>
            <View style={styles.containerFull}>
                <View style={styles.sectionTitle}>
                    <Text style={styles.titleText}>Gerenciador de gastos</Text>
                </View>
                <View style={styles.grid}>
                    <View style={[styles.cardInfo, styles.bgRed]}>
                        <Text style={[styles.cardText]}>Despesas</Text>
                        <Text style={[styles.cardText, styles.cardTextMedium]}>{formatCurrency(totals.despesas)}</Text>
                    </View>
                    <View style={[styles.cardInfo, styles.bgGreen]}>
                        <Text style={[styles.cardText]}>Receitas</Text>
                        <Text style={[styles.cardText, styles.cardTextMedium]}>{formatCurrency(totals.receitas)}</Text>
                    </View>
                </View>
                <View style={styles.containerTable}>
                    {/* cabeçalho */}
                    <View style={[styles.row, styles.header]}>
                        <Text style={[styles.cell, styles.headerText]}>Tipo</Text>
                        <Text style={[styles.cell, styles.headerText]}>Valor</Text>
                        <Text style={[styles.cell, styles.headerText]}>Data</Text>
                    </View>
                    {/* linhas da tabela */}
                    {transactions.length > 0 ? (
                        <FlatList
                            data={transactions}
                            keyExtractor={(item) => item.id.toString()} // Garanta que o id seja string
                            renderItem={({ item }) => (
                                <View style={[
                                    styles.row,
                                    {
                                        backgroundColor: item.type === "Despesa" ? "#f88e8eba" : "#91ff9ab5"
                                    }
                                ]}>
                                    <Text style={styles.cell}>{item.type}</Text>
                                    <Text style={styles.cell}>{formatCurrency(item.value)}</Text>
                                    <Text style={styles.cell}>{formatDate(item.date)}</Text>
                                </View>
                            )}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>--</Text>
                                </View>
                            )}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>--</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                    <Feather name="plus" size={28} color="#fff" />
                </TouchableOpacity>

                {/* modal */}
                <SafeAreaProvider>
                    <SafeAreaView style={styles.fullscreen}>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={modalVisible}
                            onRequestClose={() => setModalVisible(false)}>
                            <View style={styles.overlay}>
                                <View style={styles.modalView}>
                                    <Text style={styles.modalText}>Registrar</Text>

                                    <View style={styles.pickerWrapper}>
                                        <Picker
                                            selectedValue={selectedValue}
                                            onValueChange={(itemValue) => setSelectedValue(itemValue)}
                                            style={styles.picker}
                                        >
                                            <Picker.Item label="Receita" value="Receita" />
                                            <Picker.Item label="Despesa" value="Despesa" />
                                        </Picker>
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Valor"
                                        value={value}
                                        onChangeText={setValue}
                                        keyboardType="numeric"
                                    />

                                    <View style={styles.boxGroup}>
                                        <Pressable style={[styles.button, styles.bgBlue]} onPress={saveTransaction}>
                                            <Text style={styles.buttonText}>Salvar</Text>
                                        </Pressable>

                                        <Pressable
                                            style={[styles.button, styles.bgRed]}
                                            onPress={() => setModalVisible(false)}>
                                            <Text style={styles.buttonText}>Cancelar</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </SafeAreaView>
                </SafeAreaProvider>
                {/* end modal */}
            </View>
            <View style={[{ backgroundColor: "rgba(0,0,0,0.8)", padding: 25, backdropFilter: "blur(7px)" }]}></View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        // alignItems: "center",
        // justifyContent: "center"
    },
    containerFull: {
        flex: 1,
        padding: 16,
        backgroundColor: "#FFFFFF",
        // alignItems: "center",
        // justifyContent: "center"
    },
    boxGroup: {
        flexDirection: "row",
        gap: 8,
    },
    sectionTitle: {
        padding: 16,
        backgroundColor: "#F8F8F8",
        marginBottom: 16,
        marginTop: 10,
        borderRadius: 8
    },
    titleText: {
        fontSize: 20,
        fontWeight: 500,
        color: "#000",
    },
    grid: {
        gridAutoColumns: "2/12",
        gap: 12
    },
    cardInfo: {
        padding: 16,
        flexDirection: "column",
        borderRadius: 16
    },
    bgRed: {
        backgroundColor: "#f51111"
    },
    bgGreen: {
        backgroundColor: "#1c9e0b"
    },
    bgBlue: {
        backgroundColor: "#2593fa"
    },
    cardText: {
        color: "#FFF",
        fontSize: 18,
    },
    cardTextMedium: {
        fontWeight: 500,
    },
    containerTable: {
        marginTop: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    cell: {
        flex: 1,
        textAlign: 'center',
    },
    header: {
        backgroundColor: '#f0f0f0',
    },
    headerText: {
        fontWeight: 'bold',
    },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 20,
        zIndex: 10,
        backgroundColor: '#4CAF50',
        width: 60,
        height: 60,
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5, // sombra Android
        shadowColor: '#000', // sombra iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreen: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // overlay
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        width: "90%",
        position: "relative",
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        width: "50%"
    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 30,
        fontWeight: 500
    },
    input: {
        width: "100%",
        height: 50,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        color: "#000",
        borderColor: "#F8F8F8"
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    label: { fontSize: 18, marginBottom: 10 },
    pickerWrapper: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#F8F8F8"
    },
    picker: {
        height: 50,
        width: '100%',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
})