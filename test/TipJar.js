// Importa las librerías necesarias de Hardhat y Chai.
// `ethers` es la librería para interactuar con el contrato.
// `expect` de Chai nos permite hacer aserciones (verificaciones).
const { expect } = require("chai");
const { ethers } = require("hardhat");

// Describe el conjunto de pruebas para el contrato TipJar.
// `describe` es una función de Mocha para agrupar tests relacionados.
describe("TipJar", function () {
    let TipJar; // Declarará la clase del contrato (como un blueprint)
    let tipJar; // Declarará la instancia del contrato desplegado
    let owner; // Dirección del propietario del contrato
    let tipper1; // Dirección del primer "propinador"
    let tipper2; // Dirección del segundo "propinador"

    // `beforeEach` es un hook de Mocha que se ejecuta antes de cada test.
    // Esto es útil para configurar un estado limpio para cada prueba.
    beforeEach(async function () {
        // Obtenemos las "firmantes" (signers) que Hardhat nos provee.
        // Un signer es una abstracción de una cuenta de Ethereum.
        // La primera cuenta será el owner, las siguientes serán los tippers.
        [owner, tipper1, tipper2] = await ethers.getSigners();

        // Obtenemos la Factory del contrato TipJar.
        // Esto es como obtener el "plano" o la "clase" del contrato Solidity.
        TipJar = await ethers.getContractFactory("TipJar");

        // Desplegamos una nueva instancia del contrato TipJar.
        // Cada test tendrá su propia instancia limpia para evitar interferencias.
        tipJar = await TipJar.deploy();

        // Esperamos a que el contrato se despliegue completamente en la red de pruebas de Hardhat.
        await tipJar.waitForDeployment();
    });

    // --- Tests para la función `tip` ---

    it("Debería permitir a los usuarios enviar propinas y emitir el evento NewTip", async function () {
        const tipAmount = ethers.parseEther("1"); // 1 ETH en Wei

        // Conectamos como tipper1 y enviamos 1 ETH con un mensaje.
        // `value` es la forma de adjuntar Ether a la transacción.
        await expect(tipJar.connect(tipper1).tip("Gracias por el buen servicio!", { value: tipAmount }))
            .to.emit(tipJar, "NewTip") // Verificamos que se emita el evento NewTip
            .withArgs(tipper1.address, tipAmount, "Gracias por el buen servicio!"); // Verificamos los argumentos del evento

        // Verificamos que el balance del contrato haya aumentado.
        // `ethers.provider.getBalance` es una función para obtener el balance de una dirección.
        const contractBalance = await ethers.provider.getBalance(tipJar.target);
        expect(contractBalance).to.equal(tipAmount);
    });

    it("No debería permitir propinas de 0 ETH", async function () {
        // Intentamos enviar una propina de 0 ETH.
        // `to.be.revertedWith` verifica que la transacción falle con un mensaje de error específico.
        await expect(tipJar.connect(tipper1).tip("Cero propina", { value: 0 }))
            .to.be.revertedWith("No se puede enviar una propina de 0 ETH.");
    });

    // --- Tests para la función `withdraw` ---

    it("Debería permitir al owner retirar fondos", async function () {
        const tipAmount1 = ethers.parseEther("0.5");
        const tipAmount2 = ethers.parseEther("0.2");

        // tipper1 envía una propina
        await tipJar.connect(tipper1).tip("Primer tip", { value: tipAmount1 });
        // tipper2 envía una propina
        await tipJar.connect(tipper2).tip("Segundo tip", { value: tipAmount2 });

        // Calculamos el balance total esperado en el contrato
        const totalContractBalance = tipAmount1 + tipAmount2;
        expect(await ethers.provider.getBalance(tipJar.target)).to.equal(totalContractBalance);

        // Obtenemos el balance del owner antes del retiro
        const ownerInitialBalance = await ethers.provider.getBalance(owner.address);

        // El owner retira los fondos
        // Guardamos la transacción para analizar el costo del gas
        const tx = await tipJar.connect(owner).withdraw();
        const receipt = await tx.wait(); // Esperamos a que la transacción se mine

        // Calculamos el gas gastado en la transacción de retiro
        // `receipt.gasUsed` es el gas consumido.
        // `receipt.gasPrice` es el precio del gas en la transacción.
        const gasCost = receipt.gasUsed * receipt.gasPrice;

        // Verificamos que el balance del contrato sea 0 después del retiro
        expect(await ethers.provider.getBalance(tipJar.target)).to.equal(0);

        // Verificamos que el balance del owner haya aumentado por el total retirado,
        // menos el costo del gas de la transacción de retiro.
        const ownerFinalBalance = await ethers.provider.getBalance(owner.address);
        // Usamos `toBeWithin` porque el balance final del owner puede variar
        // ligeramente debido a las fluctuaciones de gas en el entorno de prueba.
        expect(ownerFinalBalance).to.be.closeTo(ownerInitialBalance + totalContractBalance - gasCost, ethers.parseEther("0.0001"));
    });


    it("No debería permitir que otros usuarios retiren fondos", async function () {
        const tipAmount = ethers.parseEther("1");
        await tipJar.connect(tipper1).tip("Una propina para el contrato", { value: tipAmount });

        // Intentamos que tipper1 (que no es el owner) retire fondos.
        // Esperamos que la transacción se revierta con el mensaje de error específico.
        await expect(tipJar.connect(tipper1).withdraw())
            .to.be.revertedWith("Solo el owner puede retirar los fondos.");
    });

    it("Debería manejar el retiro cuando no hay fondos", async function () {
        // Intentamos retirar cuando el contrato no tiene ETH.
        // Aseguramos que la transacción sea del owner.
        await expect(tipJar.connect(owner).withdraw())
            .to.be.revertedWith("No hay fondos para retirar.");
    });
});