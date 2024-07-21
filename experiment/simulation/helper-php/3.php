<?php
//ladZakA
       
$N=["sing", "plu", "sing", "plu"];
$C=["dr", "dr", "ob", "ob"];

$table_path="../Exp3/paradigm.txt";
$f1 =  fopen($table_path, "r");
$buffer2=fread($f1, filesize($table_path));
echo "<input type='hidden' name='answer' id='answer' value=\"".$buffer2."\">";
$val=preg_split('# #m', $buffer2) ;
echo "<table cellspacing=\"-2\" cellpadding=\"4\" border=\"1\" style=\"text-align:center;\">";
echo "<tr> <b> For Example for ".$val[1].":</b><br/><br/>";
echo "<th>Delete</th><th>Add</th><th>Number</th><th>Case</th></tr>";
for($k=2;$k<6;$k++){
	echo "<tr>";
	echo "<td>".$val[$k]."</td>";
	echo "<td>".$val[$k+4]."</td>";
	echo "<td>".$N[$k-2]."</td>";
	echo "<td>".$C[$k-2]."</td>";
	echo "</tr>";
}

?>
