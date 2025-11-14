import natural from 'natural';
import { trainData } from '../ml/trainData.js';

console.log('\n===============================================');
console.log('VALIDAÇÃO DOS MODELOS DE CLASSIFICAÇÃO');
console.log('===============================================\n');

const shuffled = [...trainData].sort(() => Math.random() - 0.5);
const splitIndex = Math.floor(shuffled.length * 0.8);
const trainSet = shuffled.slice(0, splitIndex);
const testSet = shuffled.slice(splitIndex);

console.log('Total de exemplos:', trainData.length);
console.log('Dados de treino:', trainSet.length, '(80%)');
console.log('Dados de teste:', testSet.length, '(20%)\n');

console.log('Treinando modelos...');
const classifierUrg = new natural.BayesClassifier();
const classifierArea = new natural.BayesClassifier();

for (const item of trainSet) {
  classifierUrg.addDocument(item.text, item.urgency);
  classifierArea.addDocument(item.text, item.area);
}

classifierUrg.train();
classifierArea.train();
console.log('Modelos treinados com sucesso.\n');

console.log('===============================================');
console.log('RESULTADOS - CLASSIFICAÇÃO DE URGÊNCIA');
console.log('===============================================\n');

const confusionUrg = {
  'low': { 'low': 0, 'medium': 0, 'high': 0 },
  'medium': { 'low': 0, 'medium': 0, 'high': 0 },
  'high': { 'low': 0, 'medium': 0, 'high': 0 }
};

for (const item of testSet) {
  const predicted = classifierUrg.classify(item.text);
  confusionUrg[item.urgency][predicted]++;
}

console.log('Matriz de Confusão:');
console.log('-------------------------------------------');
console.log('Real      | Low    | Medium | High   |');
console.log('-------------------------------------------');
console.log(`Low       |  ${String(confusionUrg['low']['low']).padStart(3)}   |   ${String(confusionUrg['low']['medium']).padStart(3)}  |  ${String(confusionUrg['low']['high']).padStart(3)}   |`);
console.log(`Medium    |  ${String(confusionUrg['medium']['low']).padStart(3)}   |   ${String(confusionUrg['medium']['medium']).padStart(3)}  |  ${String(confusionUrg['medium']['high']).padStart(3)}   |`);
console.log(`High      |  ${String(confusionUrg['high']['low']).padStart(3)}   |   ${String(confusionUrg['high']['medium']).padStart(3)}  |  ${String(confusionUrg['high']['high']).padStart(3)}   |`);
console.log('-------------------------------------------\n');

console.log('Métricas por Classe:\n');

const classesUrg = ['low', 'medium', 'high'];
let correctUrg = 0;

for (const cls of classesUrg) {
  const tp = confusionUrg[cls][cls];
  correctUrg += tp;
  
  let fp = 0;
  let fn = 0;
  
  for (const other of classesUrg) {
    if (other !== cls) {
      fp += confusionUrg[other][cls];
      fn += confusionUrg[cls][other];
    }
  }
  
  const precision = tp + fp > 0 ? ((tp / (tp + fp)) * 100).toFixed(2) : 0;
  const recall = tp + fn > 0 ? ((tp / (tp + fn)) * 100).toFixed(2) : 0;
  const f1 = precision > 0 && recall > 0 ? 
    ((2 * precision * recall) / (parseFloat(precision) + parseFloat(recall))).toFixed(2) : 0;
  
  console.log(`Classe "${cls}":`);
  console.log(`  Precisão: ${precision}%`);
  console.log(`  Recall: ${recall}%`);
  console.log(`  F1-Score: ${f1}%\n`);
}

const accuracyUrg = ((correctUrg / testSet.length) * 100).toFixed(2);
console.log(`Acurácia Geral: ${accuracyUrg}%`);
console.log(`Acertos: ${correctUrg} de ${testSet.length}\n`);

console.log('===============================================');
console.log('RESULTADOS - CLASSIFICAÇÃO DE ÁREA');
console.log('===============================================\n');

const confusionArea = {
  'collar': { 'collar': 0, 'antenna': 0, 'internet': 0, 'power': 0 },
  'antenna': { 'collar': 0, 'antenna': 0, 'internet': 0, 'power': 0 },
  'internet': { 'collar': 0, 'antenna': 0, 'internet': 0, 'power': 0 },
  'power': { 'collar': 0, 'antenna': 0, 'internet': 0, 'power': 0 }
};

for (const item of testSet) {
  const predicted = classifierArea.classify(item.text);
  confusionArea[item.area][predicted]++;
}

console.log('Matriz de Confusão:');
console.log('-------------------------------------------------------');
console.log('Real      | Collar | Antenna | Internet | Power  |');
console.log('-------------------------------------------------------');
console.log(`Collar    |  ${String(confusionArea['collar']['collar']).padStart(3)}   |   ${String(confusionArea['collar']['antenna']).padStart(3)}   |    ${String(confusionArea['collar']['internet']).padStart(3)}    |  ${String(confusionArea['collar']['power']).padStart(3)}   |`);
console.log(`Antenna   |  ${String(confusionArea['antenna']['collar']).padStart(3)}   |   ${String(confusionArea['antenna']['antenna']).padStart(3)}   |    ${String(confusionArea['antenna']['internet']).padStart(3)}    |  ${String(confusionArea['antenna']['power']).padStart(3)}   |`);
console.log(`Internet  |  ${String(confusionArea['internet']['collar']).padStart(3)}   |   ${String(confusionArea['internet']['antenna']).padStart(3)}   |    ${String(confusionArea['internet']['internet']).padStart(3)}    |  ${String(confusionArea['internet']['power']).padStart(3)}   |`);
console.log(`Power     |  ${String(confusionArea['power']['collar']).padStart(3)}   |   ${String(confusionArea['power']['antenna']).padStart(3)}   |    ${String(confusionArea['power']['internet']).padStart(3)}    |  ${String(confusionArea['power']['power']).padStart(3)}   |`);
console.log('-------------------------------------------------------\n');

console.log('Métricas por Classe:\n');

const classesArea = ['collar', 'antenna', 'internet', 'power'];
let correctArea = 0;

for (const cls of classesArea) {
  const tp = confusionArea[cls][cls];
  correctArea += tp;
  
  let fp = 0;
  let fn = 0;
  
  for (const other of classesArea) {
    if (other !== cls) {
      fp += confusionArea[other][cls];
      fn += confusionArea[cls][other];
    }
  }
  
  const precision = tp + fp > 0 ? ((tp / (tp + fp)) * 100).toFixed(2) : 0;
  const recall = tp + fn > 0 ? ((tp / (tp + fn)) * 100).toFixed(2) : 0;
  const f1 = precision > 0 && recall > 0 ? 
    ((2 * precision * recall) / (parseFloat(precision) + parseFloat(recall))).toFixed(2) : 0;
  
  console.log(`Classe "${cls}":`);
  console.log(`  Precisão: ${precision}%`);
  console.log(`  Recall: ${recall}%`);
  console.log(`  F1-Score: ${f1}%\n`);
}

const accuracyArea = ((correctArea / testSet.length) * 100).toFixed(2);
console.log(`Acurácia Geral: ${accuracyArea}%`);
console.log(`Acertos: ${correctArea} de ${testSet.length}\n`);

console.log('===============================================');
console.log('RESUMO FINAL');
console.log('===============================================');
console.log(`Acurácia Urgência: ${accuracyUrg}%`);
console.log(`Acurácia Área: ${accuracyArea}%`);
console.log('===============================================\n');

process.exit();