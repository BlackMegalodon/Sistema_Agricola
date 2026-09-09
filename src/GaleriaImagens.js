import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import * as ImagePicker from 'expo-image-picker';

export default function GaleriaImagens() {
    const [imagemUri, setImagemUri] = useState(null);

    const selecionarimagens = async () => {
        const permissaoResultado = await ImagePicker.requestCameraPermissionsAsync();

        if (permissaoResultado.granted === false) {
            alert("Permita-me tirar fotos tuas, vagabundo");
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

    return (
        <View style={style.container}>
            <TouchableOpacity style={style.botao} onPress={selecionarimagens}>
                <Text style={styles.textobotao}>Selecionar Imagem da Galeria</Text>
            </TouchableOpacity>
            {imagemUri && <Image source={{ uri = imagemUri }} style={styles.previewImage} />}
        </View>
    );
}

 const styles = StyleSheet.create({
container: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5'},
botao: {padding: 15, borderRadius: 8, backgroundColor: '#007AFF'},
textobotao: {color: '#ffffff', fontWeight: 'bold'},
previewImage: {width: 200, height: 150, marginTop: 20, borderRadius: 8}
 });