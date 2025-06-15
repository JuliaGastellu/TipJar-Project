const { ethers } = require("hardhat");
require("dotenv").config(); 

const CONTRACT_ADDRESS = "0x8a7C167D9dc7ac4Fa4cC25E71E06a097ea29aaBF";

async function main() {
    console.log("--- Iniciando interacción con TipJar en Sepolia ---");
    const [owner] = await ethers.getSigners();
    console.log(`Conectado como owner: ${owner.address}`);

    const TipJar = await ethers.getContractFactory("TipJar");
    const tipJar = new ethers.Contract(CONTRACT_ADDRESS, TipJar.interface, owner);

    console.log(`Contrato TipJar conectado en: ${tipJar.target}`);

    // --- Parte 1: Mostrar el balance actual del contrato ---
    console.log("\n--- Chequeando balance inicial del contrato ---");
    let contractBalance = await ethers.provider.getBalance(tipJar.target);
    console.log(`Balance actual del contrato TipJar: ${ethers.formatEther(contractBalance)} ETH`);

    // --- Parte 2: Enviar una propina con mensaje ---
    console.log("\n--- Enviando una propina al contrato ---");
    const tipAmount = ethers.parseEther("0.001"); // Envía 0.001 ETH como propina
    const tipMessage = "¡Gracias por el curso!";

    try {
        console.log(`Enviando ${ethers.formatEther(tipAmount)} ETH desde ${owner.address} con mensaje: "${tipMessage}"`);
        const tipTx = await tipJar.connect(owner).tip(tipMessage, { value: tipAmount });
        await tipTx.wait(); // Esperar a que la transacción se mine

        console.log("¡Propina enviada con éxito!");

        // Mostrar balance después de la propina
        contractBalance = await ethers.provider.getBalance(tipJar.target);
        console.log(`Nuevo balance del contrato TipJar: ${ethers.formatEther(contractBalance)} ETH`);

    } catch (error) {
        console.error("Error al enviar la propina:", error.message);
    }

    // --- Parte 3: Ejecutar withdraw() desde el owner ---
    console.log("\n--- Intentando retirar fondos del contrato como owner ---");

    // Obtenemos el balance del owner antes del retiro para verificar el cambio
    const ownerInitialBalance = await ethers.provider.getBalance(owner.address);
    console.log(`Balance inicial del owner (${owner.address}): ${ethers.formatEther(ownerInitialBalance)} ETH`);

    // Obtenemos el balance del contrato justo antes del retiro
    const balanceBeforeWithdraw = await ethers.provider.getBalance(tipJar.target);
    console.log(`Balance del contrato antes del retiro: ${ethers.formatEther(balanceBeforeWithdraw)} ETH`);

    if (balanceBeforeWithdraw > 0) {
        try {
            const withdrawTx = await tipJar.connect(owner).withdraw();
            const receipt = await withdrawTx.wait(); // Esperar a que la transacción se mine

            console.log("¡Fondos retirados con éxito por el owner!");

            // Verificar el balance del contrato después del retiro
            contractBalance = await ethers.provider.getBalance(tipJar.target);
            console.log(`Balance del contrato TipJar después del retiro: ${ethers.formatEther(contractBalance)} ETH`);

            // Verificar el balance del owner después del retiro (considerando el gas)
            const ownerFinalBalance = await ethers.provider.getBalance(owner.address);
            const gasCost = receipt.gasUsed * receipt.gasPrice; // Calcular el gas gastado
            console.log(`Balance final del owner (${owner.address}): ${ethers.formatEther(ownerFinalBalance)} ETH`);
            console.log(`Costo de gas de la transacción de retiro: ${ethers.formatEther(gasCost)} ETH`);
            console.log(`Verificación: (Balance Inicial + Balance Contrato) - Costo Gas = Balance Final`);
            console.log(`Esperado: ${ethers.formatEther(ownerInitialBalance + balanceBeforeWithdraw - gasCost)} ETH`);
            console.log(`Actual: ${ethers.formatEther(ownerFinalBalance)} ETH`);


        } catch (error) {
            console.error("Error al retirar fondos:", error.message);
        }
    } else {
        console.log("No hay fondos en el contrato para retirar.");
    }

    console.log("\n--- Interacción con TipJar finalizada ---");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});