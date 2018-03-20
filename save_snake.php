<?php
$speciesNo = $_REQUEST["speciesNo"];
$worldID = $_REQUEST["worldID"];

$dir = "data/" . $worldID;
if (!file_exists($dir)) {
	mkdir($dir, 0777);
}
$filename = $dir . "/snakeData_" . $speciesNo . ".json";
if (file_exists($filename)) {
	unlink($filename);
}
$data = json_encode($_REQUEST);

$fp = fopen($filename, 'w');
fwrite($fp, $data);
fclose($fp);

echo json_encode(array("success"=>true, "speciesNo"=>$speciesNo));
?>
