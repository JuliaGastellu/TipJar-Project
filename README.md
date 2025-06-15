# 💰 TipJar Contract: Un Contrato de Propinas en Ethereum Sepolia 🚀

¡Bienvenida/o al proyecto TipJar! Este contrato inteligente, desarrollado con **Solidity**, **Hardhat** y **Ethers.js**, te permite recibir propinas en ETH con mensajes personalizados y gestionar esos fondos como propietario. 

---

## ✍️ Autora

**Julia Gastellu**

---

## 🎯 Objetivo del Proyecto

El corazón de este proyecto es construir y desplegar un contrato `TipJar.sol` que cumpla con los siguientes objetivos:

* **Recibir Propinas:** Permitir a cualquier usuario enviar ETH (propinas) junto con un mensaje, registrando cada transacción.
* **Gestión de Fondos:** Habilitar al propietario del contrato (`owner`) para retirar todos los fondos acumulados.
* **Transparencia:** Emitir eventos para cada propina recibida, facilitando la auditoría y la interacción con interfaces externas.
* **Despliegue en Testnet:** Desplegar el contrato en la **testnet Sepolia** para pruebas en un entorno real.
* **Automatización:** Implementar tests automatizados y scripts de interacción usando Hardhat y Ethers.js.

---

## 🛠️ Requisitos Previos: Prepara Tu Entorno

Para compilar, desplegar y ejecutar este proyecto, necesitas tener configurado tu entorno de desarrollo. Sigue estos pasos para asegurarte de que tienes todo lo necesario:

* **Node.js y npm:**
    * **Descarga e Instala:** Si aún no lo tienes, obtén Node.js (se recomienda la versión LTS) desde [nodejs.org](https://nodejs.org/). `npm` (Node Package Manager) se instalará automáticamente con Node.js.
    * **Verifica la Instalación:** Abre tu terminal y ejecuta:
        ```bash
        node -v
        npm -v
        ```
* **Visual Studio Code (VSC):**
    * **Descarga e Instala:** Un editor de código potente y gratuito, ideal para desarrollo Web3. Descárgalo desde [code.visualstudio.com](https://code.visualstudio.com/).
    * **Extensión de Solidity:** Dentro de VSC, ve a la sección de Extensiones y busca e instala la extensión **"Solidity" por Juan Blanco**. Te brindará resaltado de sintaxis, autocompletado y detección de errores.
* **MetaMask:**
    * **Instala:** Es la billetera de Ethereum más popular en forma de extensión de navegador. Descárgala desde [metamask.io/download/](https://metamask.io/download/).
    * **Configura una Cuenta:** Crea una nueva billetera y, **muy importante**, guarda tu frase de recuperación (seed phrase) en un lugar seguro.
    * **Obtén Sepolia ETH:** Necesitarás Ether de prueba para pagar el gas de las transacciones. Consíguelo en un faucet de Sepolia, como [sepoliafaucet.com](https://sepoliafaucet.com/) o [infura.io/faucet/sepolia](https://www.infura.io/faucet/sepolia). Asegúrate de que tu MetaMask esté conectado a la "Sepolia Test Network".
* **Proveedor de Nodos (Infura o Alchemy):**
    * Necesitas una **API Key (Project ID)** para que Hardhat pueda interactuar con la testnet Sepolia sin tener que ejecutar un nodo completo.
    * **Regístrate en Infura:** Visita [infura.io/register](https://www.infura.io/register), crea una cuenta gratuita y un proyecto de tipo **"Web3 API"**. Dentro del panel de tu proyecto, selecciona la red **"Sepolia"** y copia la **cadena alfanumérica de tu Project ID** que aparece en la URL del endpoint HTTPS (después de `/v3/`).

---

## ⚙️ Configuración y Preparación del Proyecto

Una vez que tengas los requisitos previos, sigue estos pasos para configurar tu proyecto:

1.  **Clonar el Repositorio e Instalar Hardhat:**
    ```bash
    git clone [[https://github.com/JuliaGastellu/TipJar-Project](https://github.com/JuliaGastellu/TipJar-Project)] # Reemplaza con tu URL real si el repo ya existe
    cd TipJar-Project
    ```
    Si estás creando un proyecto desde cero en tu máquina:
    ```bash
    mkdir TipJar-Project
    cd TipJar-Project
    npm init --yes
    npm install --save-dev hardhat
    npx hardhat # Selecciona "Create a JavaScript project" para la estructura básica
    ```

2.  **Instalar Dependencias Adicionales:**
    ```bash
    npm install
    npm install --save-dev dotenv # Necesario para cargar variables de entorno de forma segura
    ```

3.  **Configurar Variables de Entorno (`.env`):**
    * Crea un archivo llamado `.env` en la **raíz de tu proyecto** (al mismo nivel que `hardhat.config.js`).
    * **¡ADVERTENCIA DE SEGURIDAD!** Este archivo **NO DEBE SUBIRSE A GITHUB**. El `.gitignore` ya está configurado para ignorarlo.
    * Agrega tus credenciales esenciales de la siguiente manera, reemplazando los valores de ejemplo:
        ```env
        INFURA_API_KEY="TU_PROJECT_ID_DE_INFURA_PARA_SEPOLIA_AQUI"
        PRIVATE_KEY="TU_CLAVE_PRIVADA_DE_METAMASK_SIN_EL_PREFIJO_0X_Y_DE_64_CARACTERES"
        ```
    * **Nota sobre `PRIVATE_KEY`:** Asegúrate de que sea una cadena de 64 caracteres hexadecimales y que no comience con `0x`. Puedes exportarla desde MetaMask (solo de tu cuenta de prueba) y limpiar el `0x` si lo tiene.

4.  **Actualizar `hardhat.config.js`:**
    * Abre el archivo `hardhat.config.js` y verifica que esté configurado para usar las variables de entorno y la red Sepolia. Debería lucir similar a lo siguiente (asegurándote de que la versión de `solidity` coincida con tu contrato):
        ```javascript
        require("@nomicfoundation/hardhat-toolbox");
        require("dotenv").config();

        const INFURA_API_KEY = process.env.INFURA_API_KEY;
        const PRIVATE_KEY = process.env.PRIVATE_KEY;

        module.exports = {
          solidity: "0.8.19", // Ajusta si tu pragma Solidity es diferente (ej. "0.8.0")
          networks: {
            sepolia: {
              url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
              accounts: [PRIVATE_KEY],
            },
          },
        };
        ```

---

## 🚀 Uso del Proyecto: Compilar, Probar, Desplegar e Interactuar

Una vez que tu entorno esté configurado, puedes interactuar con el proyecto:

### 1. Compilar el Contrato

Compila tu contrato Solidity `TipJar.sol` a bytecode EVM y ABI:

```bash
npx hardhat compile
