<?php

include("../config/connection.php");

$id_season = $_POST["idSeason"];
//$id_serie = $_POST["idSerie"];
$id_serie = $_POST["selectOptions"];
$episodes = $_POST["episodes"];
$release_date = $_POST["releaseDate"];
$url_img = $_POST["urlImg"];

function runQuery($conn, $query, $types, $params) {
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
    // Obtener la fecha de la temporada anterior
    $query = "SELECT MAX(fecha_estreno) FROM temporadas WHERE id_serie = ? AND id < ?";
    $params = [$id_serie, $id_season];
    $previous_date = runQuery($conn, $query, "ii", $params);

    // Obtener la fecha de la temporada siguiente (si no es la última temporada)
    $query = "SELECT MIN(fecha_estreno) FROM temporadas WHERE id_serie = ? AND id > ?";
    $next_date = runQuery($conn, $query, "ii", $params);

    // Validar la nueva fecha de estreno
    $is_valid = true;

    if ($previous_date && $release_date <= $previous_date) {

        $is_valid = false;

        $response = [
            "success" => false,
            "message" => "La fecha de estreno debe ser posterior a la de la temporada anterior, " . (new DateTime($previous_date))->format("d-m-Y") . "."
        ];

    }

    if ($next_date && $release_date >= $next_date) {

        $is_valid = false;

        $response = [
            "success" => false,
            "message" => "La fecha de estreno debe ser anterior a la de la temporada siguiente, " . (new DateTime($next_date))->format("d-m-Y") . "."
        ];
    }

    if ($is_valid) {

        $query = "UPDATE temporadas SET episodios = ?, fecha_estreno = ?, url_poster = ? WHERE id = ?";
        $params = [$episodes, $release_date, $url_img, $id_season];
        runQuery($conn, $query, "issi", $params);

        $response = [
            "success" => true,
            "message" => "Se actualizó correctamente."
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