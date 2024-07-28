<?php

$currentDir = getcwd();
$scrappedDir = $currentDir . "/scrapped";

$contents = scandir($scrappedDir);

// movie index
if (!isset($_GET["idx"])) {
	for ($i = 2; $i < count($contents); $i++) {
		echo '<p><a href="?idx=' . $i . '">' . $contents[$i] . "</a></p>";
	}
	die();
}

// Check idx
$idx = $_GET["idx"];
if ($idx < 2 || $idx >= count($contents)) {
	die("Wrong index number!");
}

$json = json_decode(
	file_get_contents($scrappedDir . "/" . $contents[$idx]),
	true
);
?>
<!-- <?= "<pre>" . print_r($json, 1) . "</pre>" ?> -->

<title><?= $json["title"] ?></title>
<div class="container shadow rounded mt-5 p-2">
    <div class="d-flex gap-3 flex-wrap">
        <?php for ($i = 2; $i < count($contents); $i++) {
        	echo '<a href="?idx=' . $i . '">' . $contents[$i] . "</a>";
        } ?>
    </div>
    <div class="d-flex gap-3 m-3">
        <img src="<?= $json["posterUrl"] ?>" alt="poster" class="rounded">
        <div>
            <h1><?= $json["title"] ?> <?= $json["userScore"] ?>%</h1>
            <p><?= $json["overview"] ?></p>

            <p>Status: <strong><?= $json["status"] ?></strong></p>

            <a href="<?= $json[
            	"tmdbURL"
            ] ?>" target="_blank" rel="noopener noreferrer">TMDB</a>
        </div>
    </div>

    <?php if ($json["trailerURL"] !== "No trailer found") {
    	echo '<iframe src="http://www.youtube.com/embed/' .
    		$json["trailerURL"] .
    		'" width="50%" class="mx-auto" style="aspect-ratio: 16/9;" frameborder="0" allowfullscreen></iframe>';
    } else {
    	echo "<p>No trailer found!</p>";
    } ?>


    <h2 class="mt-3">Seasons</h2>
    <table class="table table-striped">
        <tr>
            <th>#</th>
            <th>Title</th>
            <th>Episodes</th>
            <th>year</th>
            <th>overview</th>
            <th></th>
        </tr>

        <?php for ($i = 0; $i < count($json["seasons"]); $i++) {
        	$season = $json["seasons"][$i];

        	echo '
            <tr>
                <td>' .
        		$i +
        		1 .
        		'</td>
                <td>' .
        		$season["title"] .
        		'</td>
                <td>' .
        		count($season["episodes"]) .
        		'</td>
                <td>' .
        		$season["year"] .
        		'</td>
                <td style="max-width: 500px;">' .
        		$season["overview"] .
        		'</td>
                <td> <a href="./season.php?idx=' .
        		$idx .
        		"&season=" .
        		$i .
        		'">View season</a> </td>
            </tr>
            ';
        } ?>



    </table>

</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js "></script>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css " rel="stylesheet">
