import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Image, FlatList, Linking, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Accelerometer } from 'expo-sensors';

const KEY_HISTORIC = '@visits_historic';

export default function MainScreen() {
    const [imagemUri, setImagemUri] = useState(null);
    const [historic, setHistoric] = useState([]);

    const [{ x, y, z }, setAcelerometro] = useState({
        x: 0,
        y: 0,
        z: 0,
    });


    useEffect(() => {
        Accelerometer.setUpdateInterval(200);

        const subscription = Accelerometer.addListener((data) => {
            setAcelerometro(data);
        });

        return () => {
            subscription && subscription.remove();
        };
    }, []);

    useEffect(() => {
        loadHistoric();
    }, []);

    const loadHistoric = async () => {
        try {
            const dadosSalvos = await AsyncStorage.getItem(KEY_HISTORIC);
            if (dadosSalvos !== null) {
                setHistoric(JSON.parse(dadosSalvos));
            }
        } catch (erro) {
            Alert.alert("Erro", "Não foi possível carregar o histórico local.");
        }
    };

    const saveVisit = async (novoRegistro) => {
        try {
            const updateHistoric = [novoRegistro, ...historic];
            await AsyncStorage.setItem(KEY_HISTORIC, JSON.stringify(updateHistoric));
            setHistoric(updateHistoric);
        } catch (erro) {
            Alert.alert("Erro", "Não foi possível salvar o hístorico de visitas");
        }
    };

    const clearHistoric = async () => {
        try {
            await AsyncStorage.removeItem(KEY_HISTORIC);
            setHistoric([]);
        } catch (erro) {
            Alert.alert("Erro", "Não foi possível limpar o histórico.");
        }
    };

    const selectImages = async () => {
        const permissao = await ImagePicker.requestCameraPermissionsAsync();

        if (permissao.granted === false) {
            if (permissao.canAskAgain === false) {
                Alert.alert(
                    "Permissão da câmera necessária",
                    'Você negou o acesso à câmera e selecionou "Não perguntar novamente".',
                    [
                        { text: "Cancelar", style: "cancel" },
                        { text: "Abrir Configurações", onPress: () => Linking.openSettings() },
                    ]
                );
            } else {
                Alert.alert(
                    "Permissão negada",
                    "Não é possível acessar a câmera sem a permissão.",
                    [{ text: "OK" }]
                );
            }
            return;
        }

        const resultado = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!resultado.canceled) {
            setImagemUri(resultado.assets[0].uri);
        }
    };

    const finishVisit = () => {
        const aceleracao = Math.sqrt(x * x + y * y + z * z);

        if (aceleracao > 2.0) {
            Alert.alert(
                "Instabilidade Física Detectada",
                "O envio foi bloqueado devido à movimentação brusca do aparelho. Mantenha o dispositivo estável e tente novamente.",
                [{ text: "OK" }]
            );
            return;
        }

        const novoRegistro = {
            id: Date.now().toString(),
            data: new Date().toLocaleString(),
            imagemUri: imagemUri,
        };

        saveVisit(novoRegistro);

        Alert.alert(
            "Visita Finalizada",
            "Dados foram salvos com sucesso",
            [{ text: "OK" }]
        );
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
            <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Captura de Imagem</Text>

                <TouchableOpacity
                    style={{ padding: 15, borderRadius: 8, backgroundColor: '#007AFF' }}
                    onPress={selectImages}
                >
                    <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Tirar Foto</Text>
                </TouchableOpacity>

                {imagemUri && (
                    <Image
                        source={{ uri: imagemUri }}
                        style={{ width: 200, height: 150, marginTop: 20, borderRadius: 8 }}
                    />
                )}

                <Text style={{ marginTop: 20 }}>x: {x.toFixed(2)} y: {y.toFixed(2)} z: {z.toFixed(2)}</Text>

                <TouchableOpacity
                    style={{ padding: 15, borderRadius: 8, backgroundColor: '#28A745', marginTop: 20 }}
                    onPress={finishVisit}
                >
                    <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Finalizar Visita</Text>
                </TouchableOpacity>

                <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 30 }}>Histórico de Visitas</Text>

                <FlatList
                    style={{ width: '100%', marginTop: 10 }}
                    data={historic}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
                            <Text>{item.data}</Text>
                            {item.imagemUri && (
                                <Image
                                    source={{ uri: item.imagemUri }}
                                    style={{ width: 80, height: 60, marginTop: 5, borderRadius: 4 }}
                                />
                            )}
                        </View>
                    )}
                    ListEmptyComponent={<Text style={{ marginTop: 10, color: '#888' }}>Nenhuma visita registrada no momento.</Text>}
                />

                <TouchableOpacity
                    style={{ padding: 12, borderRadius: 8, backgroundColor: '#DC3545', marginTop: 20 }}
                    onPress={clearHistoric}
                >
                    <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Limpar Histórico</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}