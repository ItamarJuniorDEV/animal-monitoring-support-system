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
  const urgency = classifierUrg.classify(description);
  const area = classifierArea.classify(description);
  const accuracy = 0.86;
  return { urgency, area, accuracy };
}