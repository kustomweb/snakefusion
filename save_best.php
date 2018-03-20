<?php
$worldID = $_REQUEST["worldID"];
//is it the best ever
//get the current file
$dir = "data";
$filename_best = $dir . "/snakeBest.json";
$handle = fopen($filename_best, "r");
$contents = fread($handle, filesize($filename_best));
fclose($handle);

$arrBest = array();
$arrData = array();
if ($contents!="") {
	$arrBest = json_decode($contents);
}

$dir = "data/" . $worldID;
for($speciesNo = 0; $speciesNo < 5; $speciesNo++) {
	$filename = $dir . "/snakeData_" . $speciesNo . ".json";
	
	$handle = fopen($filename, "r");
	$contents = fread($handle, filesize($filename));
	fclose($handle);
	
	$arrData[$speciesNo] = $contents;
}
$updated = "not";

if (count($arrBest)==0) {
	//first time for everything
	for($speciesNo = 0; $speciesNo < 5; $speciesNo++) {
		$arrBest[] = $arrData[$speciesNo];
	}
	$updated = "updated";
} else {
	//i must compare each species with the values passed
	//if the fitness is higher, replace
	foreach($arrBest as $bindex=>$best) {
		$jbest = json_decode($best);
		//die(print_r($jbest));
		$speciesNo = $jbest->speciesNo;
		$score = $jbest->score;
		
		$data = $arrData[$speciesNo];
		$jdata = json_decode($data);
		
		//if the score is higher, move over old man
		if ($jdata->score > $score) {
			$arrBest[$bindex] = $data;
			$updated = "updated";
		}
	}
}

$data = json_encode($arrBest);
$fp = fopen($filename_best, 'w');
fwrite($fp, $data);
fclose($fp);

echo json_encode(array("success"=>true, "worldID"=>$worldID, "updated"=>$updated));
?>
