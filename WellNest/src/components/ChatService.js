// ChatService.js
// const API_URL = 'http://192.168.1.105:8080';
// 替换成您的后端 API 地址
const API_URL = 'http://52.68.188.15';

export const sendMessage = async (threadId, message) => {
  try {
    const response = await fetch(`${API_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({threadId, message}),
    });

    if (response.ok) {
      const textResponse = await response.text(); // 假设后端返回纯文本响应
      console.log('Message response:', textResponse);
      return textResponse;
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP Error: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    return ''; // 发生错误时返回空字符串或者根据需要进行错误处理
  }
};
