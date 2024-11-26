<?php

include("../config/connection.php");

try {
    
    $query_series = "SELECT * FROM series";
    $result_series = $conn->query($query_series);
    
    $series = array();
    $seasons = array();

    if ($result_series->num_rows > 0) {
    
        while ($row = $result_series->fetch_assoc()) {
            $series[] = $row;
        }

        $query_seasons = "SELECT * FROM temporadas";
        $result_seasons = $conn->query($query_seasons);
        
        if ($result_seasons->num_rows > 0) {

            while ($row = $result_seasons->fetch_assoc()) {
                $seasons[] = $row;
            }
        }  
    }
    
    $response = [
        'success' => true,
        'series' => $series,
        'seasons' => $seasons
    ];

} catch (Exception $e) {

    $response = [
        'success' => false,
        'message' => 'Ocurrió un error al consultar la base de datos. Intente de nuevo o más tarde.'
    ];

} finally {
    echo json_encode($response);
    $conn->close();
}

?>