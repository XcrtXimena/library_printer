import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import ReactNativePosPrinter, {
  ThermalPrinterDevice,
} from 'react-native-thermal-pos-printer';

import {
  fetchTicketInfraction,
  buildEscPosTicket,
} from '@/services/ticket';

interface PrinterItem {
  device: ThermalPrinterDevice;
}

export default function App() {
  const [printers, setPrinters] = useState<PrinterItem[]>([]);
  const [selectedPrinter, setSelectedPrinter] =
    useState<PrinterItem | null>(null);
  const [loading, setLoading] = useState(false);
  

  // Permisos Android 12+
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
  };

  //  Inicializar impresoras (ESTILO PRIMER CÓDIGO)
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await requestPermissions();

        await ReactNativePosPrinter.init({
          encoding: 'UTF-8',
          width: 500,
        });

        const devices = await ReactNativePosPrinter.getDeviceList();

       // console.log('Available printers:', devices);

        const printerItems: PrinterItem[] =
          devices?.map((device) => ({ device })) || [];

        setPrinters(printerItems);
      } catch (e) {
        console.error('Error inicializando impresoras:', e);
        setPrinters([]);
        Alert.alert('Error', 'No se pudieron cargar las impresoras');
      }

      setLoading(false);
    })();
  }, []);

  // Seleccionar impresora
  const handleSelectPrinter = (printer: PrinterItem) => {
    setSelectedPrinter(printer);
  };

  // Función imprimir 
  const print = async () => {
    if (!selectedPrinter) {
      Alert.alert('Error', 'Selecciona una impresora primero');
      return;
    }

    try {
      setLoading(true);

      //  Obtener datos del endpoint
      const response = await fetchTicketInfraction();

      if (!response.success) {
        Alert.alert('Error', response.message);
        return;
      }

    

      // Conectar impresora
      await ReactNativePosPrinter.connectPrinter(
        selectedPrinter.device.getAddress(),
        { encoding: 'UTF-8' }
      );

    const img1Base64 ='';
      await ReactNativePosPrinter.printImage(img1Base64, {
      align: 'CENTER',
      width: 200,  // ancho de la imagen en pixeles
      height: 100, // alto de la imagen en pixeles
    });


    const img2Base64 = '';
await ReactNativePosPrinter.printImage(img2Base64, {
  align: 'LEFT',
  width: 200,  // ancho de la imagen en pixeles
  height: 100, // alto de la imagen en pixeles
});


      //  Construir ticket ESC/POS
      const escposString = buildEscPosTicket(response.data);

      //  Convertir a bytes
      const escposBytes = Array.from(escposString).map((c) =>
        c.charCodeAt(0)
      );

      //  Imprimir
      await ReactNativePosPrinter.printRaw(escposBytes);

      //  Alimentar papel
      await ReactNativePosPrinter.feedLine();
      await ReactNativePosPrinter.feedLine();

      await ReactNativePosPrinter.printQRCode('https://movpuebla.dyndns.org:4050/login', {
      align: 'CENTER',
      size: 6,
      errorLevel: 'H'
    });
      // Desconectar
      await ReactNativePosPrinter.disconnectPrinter();

      Alert.alert('Éxito', 'Ticket impreso correctamente');
    } catch (err: any) {
      console.log('Print Error:', err);
      Alert.alert(
        'Error al imprimir',
        err?.message || 'Error desconocido'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Impresoras disponibles</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : (
          <FlatList
            data={printers}
            keyExtractor={(item) =>
              item.device.getAddress() +
              (item.device.getName() || '')
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.printerItem,
                  selectedPrinter?.device.getAddress() ===
                    item.device.getAddress() &&
                    styles.selectedPrinter,
                ]}
                onPress={() => handleSelectPrinter(item)}
                activeOpacity={0.8}
              >
                <View style={styles.printerInfo}>
                  <Text style={styles.printerName}>
                    {item.device.getName() ||
                      item.device.getAddress() ||
                      'Impresora desconocida'}
                  </Text>
                  <Text style={styles.printerAddress}>
                    {item.device.getAddress()}
                  </Text>
                  <Text style={styles.printerType}>
                    {item.device.getType()}
                  </Text>
                </View>

                {selectedPrinter?.device.getAddress() ===
                  item.device.getAddress() && (
                  <Text style={styles.selectedIndicator}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
        )}

        <TouchableOpacity
          onPress={print}
          style={[
            styles.printButton,
            {
              backgroundColor: selectedPrinter
                ? '#2563EB'
                : '#D1D5DB',
            },
          ]}
          disabled={!selectedPrinter}
        >
          <Text style={styles.printButtonText}>
            IMPRIMIR TICKET
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  printerItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedPrinter: {
    borderColor: '#2563EB',
  },
  printerInfo: {
    flex: 1,
  },
  printerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  printerAddress: {
    fontSize: 12,
    color: '#6B7280',
  },
  printerType: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  selectedIndicator: {
    fontSize: 22,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  printButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  printButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});