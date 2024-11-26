<?php

include("../config/connection.php");

$id_serie = $_POST["selectOptions"];
$episodes = $_POST["episodes"];
$release_date = $_POST["releaseDate"];
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

    $query = "SELECT MAX(fecha_estreno) FROM temporadas WHERE id_serie = ?";
    $last_date = runQuery($conn, $query, "i", [$id_serie]);

    if ($release_date <= $last_date) {
        $response = [
            "success" => false,
            "message" => "La fecha de estreno debe ser posterior a, " . (new DateTime($last_date))->format("d-m-Y") . "."
        ];
    } else {

        $query = "INSERT INTO temporadas(id_serie, episodios, fecha_estreno, url_poster) VALUES (?, ?, ?, ?)";
        $params = [$id_serie, $episodes, $release_date, $url_img];

        if(runQuery($conn, $query, "iiss", $params) > 0){
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