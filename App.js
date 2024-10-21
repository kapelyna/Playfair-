import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

// Function to create the Playfair matrix
const createPlayfairMatrix = (keyword, alphabet) => {
  const matrix = [];
  const usedChars = new Set();
  const lowerKeyword = keyword.toLowerCase();

  // Add letters from the keyword
  for (const char of lowerKeyword) {
    if (alphabet.includes(char) && !usedChars.has(char)) {
      usedChars.add(char);
      matrix.push(char);
    }
  }

  // Add remaining letters from the alphabet
  for (const char of alphabet) {
    if (!usedChars.has(char)) {
      usedChars.add(char);
      matrix.push(char);
    }
  }
  console.log(matrix)
  return matrix;
};

const createBigrams = (text, selectedLanguage) => {
  // Convert the input text to uppercase
  text = text.replace(/\s+/g, selectedLanguage === "en" ? "x" : "_");
  
  const bigrams = [];
  const textArr = text.split("");

  for (let i = 0; i < textArr.length; i++) {
    // Check for repeated characters
    if (textArr[i] === textArr[i + 1]) {
      // Перевірка, чи кількість символів парна
      if (textArr.length % 2 !== 0) {
        // Якщо непарна кількість символів, додаємо додатковий символ
        textArr.splice(i + 1, 0, selectedLanguage === "en" ? 'x' : '_'); 
      }
    }

    // Create bigrams only if the current index is even
    if (i % 2 === 0) {
      let pair = textArr[i];

      // Ensure that there is a next character to form a pair
      if (i + 1 < textArr.length) {
        pair += textArr[i + 1];
      } else {
        // If there's no next character, fill with 'X' or '_' for odd counts
        pair += selectedLanguage === "en" ? "x" : "_";
      }

      bigrams.push(pair);
    }
  }

  console.log(bigrams);
  return bigrams;
};



// Encryption function
const playfairEncrypt = (text, keyword, alphabet, selectedLanguage) => {
  const matrix = createPlayfairMatrix(keyword, alphabet);
  const matrixSize = Math.sqrt(matrix.length);
  const bigrams = createBigrams(text, selectedLanguage);
  let encryptedText = "";

  for (const bigram of bigrams) {
    const [char1, char2] = bigram.split("");
    const index1 = matrix.indexOf(char1);
    const index2 = matrix.indexOf(char2);

    // Handle undefined characters by skipping the bigram
    if (index1 === -1 || index2 === -1) continue;

    if (index1 % matrixSize === index2 % matrixSize) {
      // Both characters in the same column
      encryptedText += matrix[(index1 + matrixSize) % matrix.length];
      encryptedText += matrix[(index2 + matrixSize) % matrix.length];
    } else if (Math.floor(index1 / matrixSize) === Math.floor(index2 / matrixSize)) {
      // Both characters in the same row
      encryptedText += matrix[((index1 + 1) % matrixSize) + Math.floor(index1 / matrixSize) * matrixSize];
      encryptedText += matrix[((index2 + 1) % matrixSize) + Math.floor(index2 / matrixSize) * matrixSize];
    } else {
      // Characters in different rows and columns
      encryptedText += matrix[Math.floor(index1 / matrixSize) * matrixSize + (index2 % matrixSize)];
      encryptedText += matrix[Math.floor(index2 / matrixSize) * matrixSize + (index1 % matrixSize)];
    }
  }
  console.log(encryptedText)
  return encryptedText;
};

// Decryption function
const playfairDecrypt = (text, keyword, alphabet, selectedLanguage) => {
  const matrix = createPlayfairMatrix(keyword, alphabet);
  const matrixSize = Math.sqrt(matrix.length);
  const bigrams = createBigrams(text, selectedLanguage);
  let decryptedText = "";

  for (const bigram of bigrams) {
    const [char1, char2] = bigram.split("");
    const index1 = matrix.indexOf(char1);
    const index2 = matrix.indexOf(char2);

    if (index1 === -1 || index2 === -1) continue; // Handle undefined characters

    if (index1 % matrixSize === index2 % matrixSize) {
      // Both characters in the same column
      decryptedText += matrix[(index1 + matrix.length - matrixSize) % matrix.length];
      decryptedText += matrix[(index2 + matrix.length - matrixSize) % matrix.length];
    } else if (Math.floor(index1 / matrixSize) === Math.floor(index2 / matrixSize)) {
      // Both characters in the same row
      decryptedText += matrix[((index1 + matrixSize - 1) % matrixSize) + Math.floor(index1 / matrixSize) * matrixSize];
      decryptedText += matrix[((index2 + matrixSize - 1) % matrixSize) + Math.floor(index2 / matrixSize) * matrixSize];
    } else {
      // Characters in different rows and columns
      decryptedText += matrix[Math.floor(index1 / matrixSize) * matrixSize + (index2 % matrixSize)];
      decryptedText += matrix[Math.floor(index2 / matrixSize) * matrixSize + (index1 % matrixSize)];
    }
  }
  if (selectedLanguage === "en") {
    // Check if 'x' was used as a placeholder, avoid removing actual 'x'
    decryptedText = decryptedText.replace(/(x)/g, "'x'"); // Only remove 'x' used as placeholder if needed
  } else {
    decryptedText = decryptedText.replace(/_/g, " "); // Only remove '_' used as placeholder
  }

  console.log(decryptedText);
  return decryptedText;

};

const PlayfairCipherApp = () => {
  const [alphabet, setAlphabet] = useState("");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const alphabets = {
    uk: "абвгдеєжзиіїйклмнопрстуфхцчшщьюя_.,'",
    en: "abcdefghiklmnopqrstuvwxyz" // English alphabet without 'j'
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setAlphabet(alphabets[language]);
  };

  const handleEncrypt = () => {
    const encryptedMessage = playfairEncrypt(inputText.toLowerCase(), keyword, alphabet, selectedLanguage);
    setOutputText(encryptedMessage);
  };

  const handleDecrypt = () => {
    const decryptedMessage = playfairDecrypt(inputText.toLowerCase(), keyword, alphabet, selectedLanguage);
    setOutputText(decryptedMessage);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.label}>Виберіть мову алфавіту:</Text>
        <View style={styles.dropdown}>
          <Text
            style={styles.selectedLanguage}
            onPress={() => handleLanguageChange(selectedLanguage === "uk" ? "en" : "uk")}
          >
            {selectedLanguage === "uk" ? "Українська" : "Англійська"}
          </Text>
        </View>

        <Text style={styles.label}>Ключове слово:</Text>
        <TextInput
          style={styles.input}
          value={keyword}
          onChangeText={setKeyword}
        />

        <Text style={styles.label}>Введіть текст:</Text>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          multiline
          numberOfLines={4}
        />

        <View style={styles.buttonContainer}>
          <Button title="Зашифрувати" onPress={handleEncrypt} />
          <Button title="Розшифрувати" onPress={handleDecrypt} />
        </View>

        <Text style={styles.label}>Результат:</Text>
        <TextInput style={styles.output} value={outputText} editable={true} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
  },
  label: {
    marginVertical: 10,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
  },
  output: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    minHeight: 100,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  dropdown: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    alignItems: "center",
  },
  selectedLanguage: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PlayfairCipherApp;
