import { TransactionProps, useTransactions } from '@/database/useTransactions';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

interface MonthlyTotals {
    receitas: number;
    despesas: number;
}

export default function HomeScreen() {
    const transactionDatabase = useTransactions();
    const [transactions, setTransactions] = useState<TransactionProps[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [value, setValue] = useState('');
    const [text, setText] = useState('');
    const [selectedValue, setSelectedValue] = useState('Receita');
    const [totals, setTotals] = useState<MonthlyTotals>({ receitas: 0, despesas: 0 });


    async function list() {
        try {

            const data: any = await transactionDatabase.list();
            setTransactions(data);
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
        }
    }

    async function loadTotals() {
        try {
            const monthlyTotals = await transactionDatabase.getMonthlyTotals();
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

    async function store() {
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
            await transactionDatabase.store({
                type: selectedValue,
                value: numericValue,
                title: text,
                date: new Date().toISOString()
            });
            setModalVisible(false);
            // setSelectedValue('');
            setText('');
            setValue('');
            await list();
            await loadTotals();
        } catch (error: any) {
            Alert.alert('Erro ao salvar', error.message);
        }
    }


    useEffect(() => {
        list();
        loadTotals();
    }, []);

    return (
         <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 0, backgroundColor: "#000" }}>
            <View style={[styles.container, { paddingVertical: 65, maxHeight: "100%" }]}>
                <View style={[styles.containerFull, { height: "100%" }]}>
                    <View style={styles.sectionTitle}>
                        <Text style={styles.titleText}>Finanças</Text>
                    </View>
                    <View style={styles.grid}>
                         <View style={[styles.cardInfo, styles.bgGreen]}>
                            <Text style={[styles.cardText]}>Receitas</Text>
                            <Text style={[styles.cardText, styles.cardTextMedium]}>{formatCurrency(totals.receitas)}</Text>
                        </View>
                        <View style={[styles.cardInfo, styles.bgRed]}>
                            <Text style={[styles.cardText]}>Despesas</Text>
                            <Text style={[styles.cardText, styles.cardTextMedium]}>{formatCurrency(totals.despesas)}</Text>
                        </View>
                    </View>
                    {/* lançamentos */}
                    <View style={{ paddingVertical: 16, marginTop: 20 }}>
                        <Text style={styles.titleList}>Lançamentos</Text>
                    </View>
                    {/* lista */}
                    <View style={styles.containerTable}>
                        {transactions.length > 0 ? (
                            <FlatList
                                style={[{ backgroundColor: "#FFF", borderRadius: 20, padding: 16, boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)" }]}
                                data={transactions}
                                scrollEnabled={false}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <View style={[{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F2F2F2" }]}>
                                        <View style={[{ width: "50%", flexDirection: "column" }]}>
                                            <Text style={[styles.cell, { textAlign: "left", color: "#000", fontWeight: 700, fontSize: 18 }]}>{item.title}</Text>
                                            <Text style={[{ fontSize: 14, color: "#444", textAlign: "left" }]}>{formatDate(item.date)}</Text>
                                        </View>
                                        <View style={[{ width: "50%", justifyContent: "flex-end" }]}>
                                            <Text style={[styles.cell, { textAlign: "right", fontSize: 22, fontWeight: 700 }, { color: `${item.type === "Despesa" ? '#f88e8eba' : '#91ff9ab5'}` }]}>{item.type === "Despesa" ? '- ' : '+ '}{formatCurrency(item.value)}</Text>
                                        </View>
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
                                        <Text style={styles.modalText}>Nova Transação</Text>

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
                                        <TextInput
                                            style={[styles.input, { height: 60 }]}
                                            placeholder="Descrição"
                                            value={text}
                                            onChangeText={setText}
                                            keyboardType="default"
                                        />

                                        <View style={styles.boxGroup}>
                                            <Pressable style={[styles.button, styles.bgBlue]} onPress={store}>
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
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    containerFull: {
        flex: 1,
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 30
    },
    boxGroup: {
        flexDirection: "row",
        gap: 8,
    },
    sectionTitle: {
        padding: 0,
        marginBottom: 16,
        marginTop: 10,
        borderRadius: 8
    },
    titleText: {
        fontFamily: "Inter_700Bold",
        fontSize: 35,
        fontWeight: 700,
        color: "#000",
    },
    titleList: {
        fontFamily: "Inter_700Bold",
        fontSize: 30,
        fontWeight: 700,
        color: "#000",
    },
    grid: {
        flexDirection: "row",
        gap: 16
    },
    cardInfo: {
        padding: 16,
        width: "48%",
        flexDirection: "column",
        borderRadius: 16,
    },
    bgRed: {
        backgroundColor: "#EF5444"
    },
    bgGreen: {
        backgroundColor: "#22C55E"
    },
    bgBlue: {
        backgroundColor: "#3B82F6"
    },
    cardText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: 700
    },
    cardTextMedium: {
        fontFamily: "Inter_700Bold",
        fontWeight: 700,
    },
    containerTable: {
        marginTop: 20,
        // borderWidth: 1,
        // borderColor: '#ccc',
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
        fontFamily: "Inter_700Bold",
        fontWeight: 700,
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
        fontFamily: "Inter_500Medium",
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
        fontFamily: "Inter_700Bold",
        color: 'white',
        fontWeight: 700,
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'left',
        width: "100%",
        fontFamily: "Inter_700Bold",
        fontSize: 30,
        fontWeight: 700
    },
    input: {
        width: "100%",
        height: 50,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        color: "#000",
        borderColor: "#F8F8F8",
        fontFamily: "Inter_400Regular",
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontFamily: "Inter_700Bold",
        fontWeight: 700,
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
        fontFamily: "Inter_400Regular",
        fontSize: 16,
        color: '#999',
    },
})