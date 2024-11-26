<?php

$host = "localhost";
$username = "root";
$password = "";
$dbname = "gestionar_series";

try {

    $conn = new mysqli($host, $username, $password, $dbname);
    
} catch (Exception $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Ocurrió un error al conectar con la base de datos. Intente de nuevo o más tarde '
    ]);

    exit();
}

?>