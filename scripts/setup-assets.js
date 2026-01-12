#!/usr/bin/env node

// ==============================================================================
// 🪐 Solar Explorer 3D - Asset Manager (Node.js + Sharp)
// ==============================================================================
// Este script baixa texturas de alta resolução e as converte para WebP
// usando o Sharp (pacote NPM robusto e multiplataforma)
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

// Suporte para __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use project root (parent of scripts folder) for textures
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TARGET_DIR = path.join(PROJECT_ROOT, 'public', 'textures');

// Cores ANSI para logs
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m'
};

// ==============================================================================
// CONFIGURAÇÃO DAS TEXTURAS
// ==============================================================================
const ASSETS = {
    'sun.jpg': 'https://raw.githubusercontent.com/yogeshkumarsaini/Solar-System/master/img/sun_hd.jpg',
    'mercury.jpg': 'https://raw.githubusercontent.com/yogeshkumarsaini/Solar-System/master/img/mercury_hd.jpg',
    'venus.jpg': 'https://raw.githubusercontent.com/yogeshkumarsaini/Solar-System/master/img/venus_hd.jpg',
    'earth.jpg': 'https://raw.githubusercontent.com/yogeshkumarsaini/Solar-System/master/img/earth_hd.jpg',
    'mars.jpg': 'https://raw.githubusercontent.com/yogeshkumarsaini/Solar-System/master/img/mars_hd.jpg',
    'jupiter.jpg': 'https://raw.githubusercontent.com/yogeshkumarsaini/Solar-System/master/img/jupiter_hd.jpg',
    'saturn.jpg': 'https://raw.githubusercontent.com/yogeshkumarsaini/Solar-System/master/img/saturn_hd.jpg',
    'uranus.jpg': 'https://raw.githubusercontent.com/yogeshkumarsaini/Solar-System/master/img/uranus_hd.jpg',
    'neptune.jpg': 'https://raw.githubusercontent.com/yogeshkumarsaini/Solar-System/master/img/neptune_hd.jpg',
    'moon.jpg': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg',
    'saturn_ring.png': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/saturn_ring.png'
};

// ==============================================================================
// FUNÇÕES AUXILIARES
// ==============================================================================

/**
 * Baixa um arquivo via HTTP/HTTPS
 */
function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        const file = fs.createWriteStream(outputPath);

        protocol.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Redirecionar
                file.close();
                fs.unlinkSync(outputPath);
                return downloadFile(response.headers.location, outputPath)
                    .then(resolve)
                    .catch(reject);
            }

            if (response.statusCode !== 200) {
                file.close();
                fs.unlinkSync(outputPath);
                return reject(new Error(`Status: ${response.statusCode}`));
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlinkSync(outputPath);
            reject(err);
        });
    });
}

/**
 * Converte imagem para WebP usando Sharp
 */
async function convertToWebP(inputPath, outputPath) {
    try {
        const sharp = (await import('sharp')).default;

        await sharp(inputPath)
            .webp({ quality: 80 })
            .toFile(outputPath);

        return true;
    } catch (error) {
        console.error(`${colors.red}Erro ao converter: ${error.message}${colors.reset}`);
        return false;
    }
}

/**
 * Verifica se o Sharp está instalado
 */
async function checkSharp() {
    try {
        await import('sharp');
        return true;
    } catch {
        return false;
    }
}

// ==============================================================================
// MAIN
// ==============================================================================
async function main() {
    console.log(`${colors.blue}🚀 Iniciando Setup de Assets do Sistema Solar...${colors.reset}\n`);

    // Criar diretório se não existir
    if (!fs.existsSync(TARGET_DIR)) {
        fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    // Verificar Sharp
    console.log(`${colors.yellow}🔍 Verificando dependências...${colors.reset}`);
    const hasSharp = await checkSharp();

    if (!hasSharp) {
        console.log(`${colors.red}❌ Erro: Sharp não encontrado!${colors.reset}`);
        console.log(`${colors.yellow}Execute: npm install sharp${colors.reset}\n`);
        process.exit(1);
    }

    console.log(`${colors.green}✅ Sharp encontrado. Conversão WebP ativada!${colors.reset}\n`);

    // Processar cada asset
    console.log(`${colors.blue}📥 Baixando texturas para: ${TARGET_DIR}${colors.reset}\n`);

    for (const [fileName, url] of Object.entries(ASSETS)) {
        const ext = path.extname(fileName);
        const baseName = path.basename(fileName, ext);
        const webpPath = path.join(TARGET_DIR, `${baseName}.webp`);
        const tempPath = path.join(TARGET_DIR, fileName);

        // Pular se WebP já existe
        if (fs.existsSync(webpPath)) {
            console.log(`${colors.green}✨ [Skip] ${baseName}.webp já existe.${colors.reset}`);
            continue;
        }

        try {
            // Download
            process.stdout.write(`⬇️  Baixando ${fileName}... `);
            await downloadFile(url, tempPath);
            console.log(`${colors.green}OK${colors.reset}`);

            // Converter para WebP
            process.stdout.write(`   🔨 Convertendo para WebP... `);
            const success = await convertToWebP(tempPath, webpPath);

            if (success) {
                console.log(`${colors.green}OK${colors.reset}`);
                // Remover arquivo original
                fs.unlinkSync(tempPath);
                console.log(`   🗑️  Original removido`);
            } else {
                console.log(`${colors.red}FALHOU${colors.reset}`);
            }

        } catch (error) {
            console.log(`${colors.red}ERRO: ${error.message}${colors.reset}`);
        }

        console.log(''); // Linha em branco
    }

    console.log(`${colors.blue}✅ Setup de assets concluído!${colors.reset}`);
    console.log(`📂 Texturas prontas em: ${TARGET_DIR}`);
}

// Executar
main().catch(console.error);