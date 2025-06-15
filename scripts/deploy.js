const hre = require("hardhat");

async function main() {
  // Obtenemos la Factory del contrato TipJar
  const TipJar = await hre.ethers.getContractFactory("TipJar");

  // Desplegamos el contrato.
  console.log("Desplegando TipJar...");
  const tipJar = await TipJar.deploy();

  // Esperamos a que el contrato se despliegue y se mine en la blockchain.
  await tipJar.waitForDeployment();

  // Imprimimos la dirección del contrato desplegado.
  console.log(`TipJar desplegado en: ${tipJar.target}`);
}

// Patrón recomendado por Hardhat para manejar errores.
// Si la función `main` falla, se captura el error y se sale con un código de error.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});