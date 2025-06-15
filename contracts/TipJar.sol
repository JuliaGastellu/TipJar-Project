// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TipJar {
    address public owner;
    
    // Evento para registrar cada propina
    event NewTip(address indexed from, uint amount, string message);

    // Estructura para guardar los detalles de cada propina
    struct Tip {
        address tipper;
        uint amount;
        string message;
        uint timestamp; // Momento en que se recibió la propina
    }
    
    // Mapeo de direcciones a un array de propinas recibidas
    mapping(address => Tip[]) public tipsOfAddress;

    // El constructor se ejecuta una sola vez al desplegar el contrato.
    // Asigna el deployer como el owner del contrato.
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Permite a los usuarios enviar propinas al contrato.
     * @param _message Un mensaje opcional que acompaña a la propina.
     */
    function tip(string memory _message) public payable {
        // Se requiere que la propina sea mayor a 0 ETH.
        require(msg.value > 0, "No se puede enviar una propina de 0 ETH.");

        // Se emite un evento para registrar la propina.
        emit NewTip(msg.sender, msg.value, _message);

        // Se guarda la información de la propina en el historial de la dirección.
        tipsOfAddress[msg.sender].push(Tip(msg.sender, msg.value, _message, block.timestamp));
    }

    /**
     * @dev Permite al owner (propietario) retirar todos los fondos del contrato.
     * Solo el owner puede ejecutar esta función.
     */
    function withdraw() public {
        // Se asegura que solo el owner pueda llamar a esta función.
        require(msg.sender == owner, "Solo el owner puede retirar los fondos.");

        uint balance = address(this).balance; // Balance actual del contrato

        // Se requiere que haya fondos disponibles para retirar.
        require(balance > 0, "No hay fondos para retirar.");

        // Transfiere todo el balance del contrato al owner.
        // Se usa `transfer()` para un envío seguro de Ether.
        payable(owner).transfer(balance); 
    }
}