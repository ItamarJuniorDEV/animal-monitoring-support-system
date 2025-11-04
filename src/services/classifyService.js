import natural from 'natural';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { trainData } from '../ml/trainData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelUrgPath = path.join(__dirname, '../ml/model_urgency.json');
const modelAreaPath = path.join(__dirname, '../ml/model_area.json');

let classifierUrg;
let classifierArea;

if (fs.existsSync(modelUrgPath) && fs.existsSync(modelAreaPath)) {
  console.log('Carregando modelos salvos...');
  classifierUrg = natural.BayesClassifier.restore(JSON.parse(fs.readFileSync(modelUrgPath, 'utf8')));
  classifierArea = natural.BayesClassifier.restore(JSON.parse(fs.readFileSync(modelAreaPath, 'utf8')));
  console.log('Modelos carregados com sucesso.');
} else {
  console.log('Treinando novos modelos...');
  classifierUrg = new natural.BayesClassifier();
  classifierArea = new natural.BayesClassifier();
  
  for (const item of trainData) {
    classifierUrg.addDocument(item.text, item.urgency);
    classifierArea.addDocument(item.text, item.area);
  }
  
  classifierUrg.train();
  classifierArea.train();
  
  fs.writeFileSync(modelUrgPath, JSON.stringify(classifierUrg), 'utf8');
  fs.writeFileSync(modelAreaPath, JSON.stringify(classifierArea), 'utf8');
  console.log('Modelos treinados e salvos.');
}

export function classifyTicket(description) {
  const urgencyClassifications = classifierUrg.getClassifications(description);
  const areaClassifications = classifierArea.getClassifications(description);
  
  const urgencySum = urgencyClassifications.reduce((sum, c) => sum + c.value, 0);
  const areaSum = areaClassifications.reduce((sum, c) => sum + c.value, 0);
  
  const urgency = urgencyClassifications[0].label;
  const area = areaClassifications[0].label;
  
  const urgencyConfidence = urgencyClassifications[0].value / urgencySum;
  const areaConfidence = areaClassifications[0].value / areaSum;
  
  const accuracy = Math.min(urgencyConfidence, areaConfidence);
  const accuracyRounded = Math.round(accuracy * 100) / 100;
  
  return { urgency, area, accuracy: accuracyRounded };
}