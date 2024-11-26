<?php
// header("Access-Control-Allow-Origin: *");
// header("Access-Control-Allow-Methods: DELETE, POST, GET, OPTIONS");
// header("Access-Control-Allow-Headers: Content-Type, Authorization");

// if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
//     http_response_code(200);
//     exit;
// }

include("../config/connection.php");

$data = json_decode(file_get_contents('php://input'), true);
$id_serie = $data["id"];


function runQuery($conn, $query, $types, $params)
{
    $stmt = $conn->prepare($query);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();

    if (stripos($query, 'SELECT') === 0) {
        $stmt->bind_result($result);
        $stmt->fetch();
        $stmt->close();
        return $result;
    } 

    $stmt->close();
}

try {
    // Contar si hay registros relacionados
    $query = "SELECT COUNT(*) FROM temporadas WHERE id_serie = ?";
    $count = runQuery($conn, $query, "i", [$id_serie]);

    if ($count > 0) {
        $response = ["success" => false, "message" => "Debe eliminar primero las temporadas de la serie."];
    } else {

        $query = "DELETE FROM series WHERE id = ?";
        runQuery($conn, $query, "i", [$id_serie]);
        $response = ["success" => true, "message" => "Serie eliminada correctamente."];

    }

} catch (Exception $e) {
    $response = [
        "success" => false,
        "message" => "Se produjo un error al intentar eliminar. Intente de nuevo o más tarde."
    ];
} finally {
    echo json_encode($response);
    $conn->close();
}

?>
