<?php include("php/startup.php"); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php includeHeadInfo(); ?>
    <script src="javascript/bracket.js"></script>
    <script src="javascript/utility.js"></script>
    <link rel="stylesheet" type="text/css" href="https://religionandstory.com/bracket/css/bracket.css"/>
</head>

<body>

	<!--Header-->
    <?php includeHeader(); ?>
    <div class="col-10 header">
        <div class="title center"></div>
        <div id="instructions" style="display: none">
            Vote on entries to help find the winner for this bracket. Entries that are blinking are currently open for voting. Click &ldquo;Submit&rdquo; when finished.
        </div>
    </div>

    <!--Main-->
    <div class="col-10 main">
        <div id="roundPicker" class="center mobileDisplay" style="margin-bottom: 1em">
            <img id="arrowPrev" class="clickable" style="width: 1.5em" src="images/left.png"  alt="left"  onclick="changeRound( 'prev' )">
            <span id="roundSpan" class="subtitle center">Round 1</span>
            <img id="arrowNext" class="clickable" style="width: 1.5em" src="images/right.png" alt="right" onclick="changeRound( 'next' )">
        </div>
        <div id="roundTimer" class="center" style="display: none; font-size: 1.25em; margin-bottom: 1em"></div>
        <div id="bracketDisplay" class="center">...</div>
        <div class="center"><button id="submit" class="button" style="width: 8em" onclick="submit()">Submit</button></div>
    </div>

    <!--
    todo:

        Bracket Page:
            Logo Title
            Load from DB
            Save to DB
        (Session monitoring matters)
    -->

</body>

<script>
    let logoInfo = {};

    logoInfo.title = "Marvel Bracket";
    logoInfo.image = "https://img.cinemablend.com/filter:scale/cb/8/7/6/f/0/7/a876f07fdc693995a2d33e0252a297ba68c7e7c21b556aa99f2f31b66fd1adb0b.jpg?mw=600";
    logoInfo.helpImage = "<?php getHelpImage() ?>";
    logoInfo.help = "Vote for characters based on how cool they are.";

    let bracketInfo = {};

    bracketInfo.active = true;
    bracketInfo.endTime = null; // "Friday 7:00 PM";
    bracketInfo.mode = "all";
    bracketInfo.entries = [
        { title: "Spider-Man", image: "https://media.playstation.com/is/image/SCEA/marvels-spider-man-hero-banner-02-ps4-us-16jul18?$native_nt$" },
        { title: "Iron Man", image: "https://cdn.images.express.co.uk/img/dynamic/36/590x/Avengers-Iron-Man-was-almost-played-by-another-major-star-936289.jpg" },
        { title: "Captain America", image: "https://cnet2.cbsistatic.com/img/Em3tYAnRSeSVCJH84Lvgv-fThrQ=/1600x900/2017/08/03/75c3b0ae-5a2d-4d75-b72b-055247b4378f/marvelinfinitywar-captainamerica.jpg" },
        { title: "Thor", image: "https://cdn.mcuexchange.com/wp-content/uploads/2018/06/thor.jpg" },
        { title: "Black Panther", image: "http://cdn.shopify.com/s/files/1/1916/3081/products/product-image-544753420_1200x1200.jpg?v=1527307028" },
        { title: "Doctor Strange", image: "https://cdn1us.denofgeek.com/sites/denofgeekus/files/styles/main_wide/public/2016/12/doctor-strange-2-benedict-cumberbatch.jpg?itok=jeAJwK4P" },
        { title: "The Incredible Hulk", image: "https://i.ytimg.com/vi/jolXso_OO-c/maxresdefault.jpg" }
        // { title: "A" },
        // { title: "B" },
        // { title: "C" },
        // { title: "D" },
        // { title: "E" },
        // { title: "F" },
        // { title: "G" },
        // { title: "H" },
        // { title: "I" },
        // { title: "J" },
        // { title: "K" },
        // { title: "L" },
        // { title: "M" },
        // { title: "N" },
        // { title: "O" },
        // { title: "P" },
        // { title: "Q" },
        // { title: "R" },
        // { title: "S" },
        // { title: "T" },
        // { title: "U" },
        // { title: "V" },
        // { title: "W" },
        // { title: "X" },
        // { title: "Y" },
        // { title: "Z" },
        // { title: "AA" },
        // { title: "AB" },
        // { title: "AC" },
        // { title: "AD" },
        // { title: "AE" },
        // { title: "AF" },
        // { title: "AG" },
        // { title: "AH" },
        // { title: "AI" },
        // { title: "AJ" },
        // { title: "AK" },
        // { title: "AL" },
        // { title: "AM" }
    ];
    bracketInfo.winners = ("").split(',').reduce( function( result, w ) { result.push( Array.from( w ) ); return result; }, [] );
    //bracketInfo.winners = ("B1").split(',').reduce( function( result, w ) { result.push( Array.from( w ) ); return result; }, [] );

    createTitleLogo( logoInfo );
    loadBracket( bracketInfo );
</script>
<?php includeModals(); ?>
</html>