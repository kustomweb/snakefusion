<?php
$arrData = array();
$filename = "data/snakeBest.json";

$handle = fopen($filename, "r");
$contents = fread($handle, filesize($filename));
fclose($handle);

echo json_encode(array("success"=>true, "data"=>$contents));
?>
