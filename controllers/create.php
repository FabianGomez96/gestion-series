<?php

include("../config/connection.php");

$name = $_POST["name"];
$selected_genres = implode(", ", $_POST["genres"]);
$production = $_POST["production"];
$url_img = $_POST["urlImg"];

function runQuery($conn, $query, $types, $params){

    $stmt = $conn->prepare($query);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    
    if (stripos($query, 'SELECT') === 0) {
        $stmt->bind_result($result);
        $stmt->fetch();
        $data = $result;
    } else {
        $data = $stmt->affected_rows;
    }

    $stmt->close();

    return $data;

}

try {

    $query = "SELECT COUNT(*) FROM series WHERE nombre = ?";
    $count = runQuery($conn, $query, "s", [$name]);

    if($count > 0){
        $response = [
            "success" => false,
            "message" => "Ya hay una serie con ese nombre."
        ];
    } else {

        $query = "INSERT INTO series(nombre, genero, produccion, url_poster) VALUES (?, ?, ?, ?)";
        $params = [$name, $selected_genres, $production, $url_img];
        
        if(runQuery($conn, $query, "ssss", $params) > 0) {
            $response = [
                "success" => true,
                "message" => "Se guardo correctamente."
            ];
        }
    }
    
} catch (Exception $e) {
    $response = [
        "success" => false,
        "message" => "Ocurrió un error al intentar guardar. Intente de nuevo o más tarde."
    ];
} finally {
    echo json_encode($response);
    $conn->close();
}

?>
