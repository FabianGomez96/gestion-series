<?php

include("../config/connection.php");

$data = json_decode(file_get_contents('php://input'), true);
$id_season = $data["id"];

try {

    $query = "DELETE FROM temporadas WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id_season);
    $stmt->execute();
    if($stmt->affected_rows > 0) {
        $response = [
        "success" => true,
        "message" => "Temporada eliminada correctamente."
        ];
    }
    
} catch (Exception $e) {
    $response = [
        "success" => false,
        "message" => "Ocurrió un error al intentar eliminar la temporada."
    ];
} finally {
    echo json_encode($response);
    $stmt->close();
    $conn->close();
    
}

?>


