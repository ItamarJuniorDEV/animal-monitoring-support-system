import natural from 'natural';
import { trainData } from '../ml/trainData.js';

console.log('=== TESTE DO MODELO DE CLASSIFICAÇÃO ===\n');

const shuffled = [...trainData].sort(() => Math.random() - 0.5);

const splitIndex = Math.floor(shuffled.length * 0.8);
const trainSet = shuffled.slice(0, splitIndex);
const testSet = shuffled.slice(splitIndex);

console.log(`Total de dados: ${trainData.length}`);
console.log(`Dados de treino (80%): ${trainSet.length}`);
console.log(`Dados de teste (20%): ${testSet.length}\n`);

const classifierUrg = new natural.BayesClassifier();
const classifierArea = new natural.BayesClassifier();

console.log('Treinando modelos...');
for (const item of trainSet) {
  classifierUrg.addDocument(item.text, item.urgency);
  classifierArea.addDocument(item.text, item.area);
}

classifierUrg.train();
classifierArea.train();
console.log('Modelos treinados!\n');

console.log('Testando modelos...');
let correctUrg = 0;
let correctArea = 0;

for (const item of testSet) {
  const predUrg = classifierUrg.classify(item.text);
  const predArea = classifierArea.classify(item.text);
  
  if (predUrg === item.urgency) correctUrg++;
  if (predArea === item.area) correctArea++;
}

const accUrg = (correctUrg / testSet.length * 100).toFixed(2);
const accArea = (correctArea / testSet.length * 100).toFixed(2);

console.log('=== RESULTADOS ===\n');
console.log(`Acurácia URGÊNCIA: ${accUrg}%`);
console.log(`   Acertos: ${correctUrg}/${testSet.length}\n`);

console.log(`Acurácia ÁREA: ${accArea}%`);
console.log(`   Acertos: ${correctArea}/${testSet.length}\n`);

process.exit();