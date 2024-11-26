<?php

include("../config/connection.php");

$id_serie = $_POST["id"];
$name = $_POST["name"];
$selected_genres = implode(", ", $_POST["genres"]);
$production = $_POST["production"];
$url_img = $_POST["urlImg"];

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

    $query = "SELECT COUNT(*) FROM series WHERE nombre = ? AND id != ?";
    $params = [$name, $id_serie];
    $count = runQuery($conn, $query, "si", $params);

    if ($count > 0) {
        $response = [
            "success" => false,
            "message" => "Ya hay una serie con ese nombre."
        ];
    } else {
        $query = "UPDATE series SET nombre = ?, genero = ?, produccion = ?, url_poster = ? WHERE id = ?";
        $params = [$name, $selected_genres, $production, $url_img, $id_serie];
        runQuery($conn, $query, "ssssi", $params);
        $response = [
            "success" => true,
            "message" => "Se actualizo correctamente."
        ];
        
    }

} catch (Exception $e) {
    $response = [
        "success" => false,
        "message" => "Ocurrió un error al intentar actualizar. Intente de nuevo o más tarde."
    ];
} finally {
    echo json_encode($response);
    $conn->close();
}

?>
