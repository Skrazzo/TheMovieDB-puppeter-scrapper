<?php

$currentDir = getcwd();
$scrappedDir = $currentDir . "/scrapped";

$contents = scandir($scrappedDir);

// Check idx
$idx = $_GET["idx"];
// Less than 2, because first two are . and ..
if ($idx < 2 || $idx >= count($contents)) {
    die("Wrong index number!");
}

// Load movie/show file
$json = json_decode(
    file_get_contents($scrappedDir . "/" . $contents[$idx]),
    true
);

// Check if season is correct
$season = $_GET["season"];
$seasons = $json["seasons"];

if (!isset($season)) {
    die("Please provide season ?season=n");
}
if ($season < 0 || $season >= count($seasons)) {
    die("Wrong season number!");
}

// $s Selected season
$s = $seasons[$season];
?>
<!-- <?= "<pre>" . print_r($s, 1) . "</pre>" ?> -->

<html>
    <head>
        <title><?= $s["title"] ?></title>
    </head>
    <body>
        <div class="container body mt-5">
            <div class="d-flex justify-content-between mb-5">
                <a href="./?idx=<?= $idx ?>"><-- Back to the list</a>
                <a href="<?= $s["link"] ?>">View on the TMDB</a>
            </div>
            <div class="d-flex justify-content-between align-items-center">
                <?= $season == 0
                    ? "<div></div>"
                    : "<a class='fs-2' href='./season.php?idx=" .
                        $idx .
                        "&season=" .
                        $season -
                        1 .
                        "'><--</a>" ?>

                <h1><?= $s["title"] ?></h1>

                <?= $season == count($seasons) - 1
                    ? "<div></div>"
                    : "<a class='fs-2' href='./season.php?idx=" .
                        $idx .
                        "&season=" .
                        $season +
                        1 .
                        "'>--></a>" ?>
            </div>

            <div class="mt-5">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Episode</th>
                            <th scope="col">Title</th>
                            <th scope="col">Date</th>
                            <th scope="col">Runtime</th>
                            <th scope="col">rating</th>
                        </tr>
                    </thead>
                    <tbody>

                    <?php for ($i = 0; $i < count($s["episodes"]); $i++) {
                        echo '
                        <tr>
                            <th scope="row">' .
                            $i +
                            1 .
                            '</th>
                            <td>' .
                            $s["episodes"][$i]["title"] .
                            '</td>
                            <td>' .
                            $s["episodes"][$i]["date"] .
                            '</td>
                            <td>' .
                            $s["episodes"][$i]["runtime"] .
                            '</td>
                            <td>' .
                            $s["episodes"][$i]["rating"] .
                            '%</td>
                        </tr>
                        ';
                    } ?>

                    </tbody>
                </table>
            </div>
        </div>
    </body>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js "></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css " rel="stylesheet">
</html>
