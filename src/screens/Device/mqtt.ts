import mqtt, { type MqttClient } from '@taoqf/react-native-mqtt';

let client: MqttClient | undefined;

let subscribeDataTopic: string;
let subscribeStatusTopic: string;
let publishCmdTopic: string;

const getDeviceSubscribeDataTopic = (deviceName: string) => `smartbox_${deviceName}/data`;
const getDeviceSubscribeStatusTopic = (deviceName: string) => `smartbox_${deviceName}/status`;
const getDevicePublishCmdTopic = (deviceName: string) => `smartbox_${deviceName}/cmd`;

export const publish = (msg: string, callback: () => void) => {
  if (client) {
    client.publish(publishCmdTopic, msg, {
      qos: 1,
    }, (err) => {
      if (err) {
        callback();
      }
    })
  }
}

export const connect = (
  brokerUrl: string,
  deviceName: string,
  onConnected: () => void,
  onDisconnected: () => void,
  onReceiveDataMessage: (msg: Buffer) => void,
  onReceiveStatusMessage: (msg: Buffer) => void,
) => {
  if (!client) {
    client = mqtt.connect(brokerUrl, {
      clientId: 'demo-tracker-app',
      clean: true,
      connectTimeout: 4000,
      username: '',
      password: '',
      reconnectPeriod: 1000,
    });

    subscribeDataTopic = getDeviceSubscribeDataTopic(deviceName);
    subscribeStatusTopic = getDeviceSubscribeStatusTopic(deviceName);
    publishCmdTopic = getDevicePublishCmdTopic(deviceName);

    onDisconnected();
    client.on('connect', () => {
      client?.subscribe(subscribeDataTopic, (err) => {
        if (err) {
          console.error(err)
          onDisconnected();
        } else {
          onConnected();
        }
      });
      client?.subscribe(subscribeStatusTopic, (err) => {
        if (err) {
          console.error(err)
          onDisconnected();
        } else {
          onConnected();
        }
      });
    });
    client.on('offline', () => {
      onDisconnected();
    });
    client.on('message', (topic, message) => {
      console.log(topic, message.toString())
      if (topic === subscribeDataTopic) {
        onReceiveDataMessage(message);
      } else if (topic === subscribeStatusTopic) {
        onReceiveStatusMessage(message);
      }
    });
  }
}

export const disconnect = () => {
  if (client) {
    client.end();
    client = undefined;
  }
}
