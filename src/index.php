<?php include("php/startup.php"); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php includeHeadInfo(); ?>
    <script src="javascript/utility.js"></script>
    <link rel="stylesheet" type="text/css" href="https://religionandstory.com/bracket/css/bracket.css"/>
</head>

<body>

	<!--Header-->
    <?php includeHeader(); ?>
    <div class="col-10 header">
        <div class="title center"><span class="clickable">
            Bracket Central
            <img id="helpIcon" style="width: .5em; padding-bottom: .25em" src="<?php getHelpImage() ?>" alt="help">
        </span></div>
        <div id="helpText" style="display: none">
            ...
        </div>
    </div>

    <!--Main-->
    <div class="col-10 main">
        <div class="subtitle center">Choose a bracket or poll</div>
        <br/>
        <div id="logos" style="display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center;"></div>
    </div>

    <!--
    todo:

        Home Page:
            dynamic columns of logos
                gray image for inactive brackets; state inactive under
    -->

</body>

<script>
    let logos = [ {
        title: "Marvel Bracket",
        image: "https://img.cinemablend.com/filter:scale/cb/8/7/6/f/0/7/a876f07fdc693995a2d33e0252a297ba68c7e7c21b556aa99f2f31b66fd1adb0b.jpg?mw=600",
        help:  "Vote for characters based on how cool they are.",
        helpImage: "<?php getHelpImage() ?>",
        id:     "Marvel",
        active: true
    }, {
        title:     "Your Bracket",
        image:     "<?php echo $image ?>",
        help:      "Additional instructions will appear here.",
        helpImage: "<?php getHelpImage() ?>",
        id:        "Thing",
        active:    true
    }, {
        title:     "Your Bracket",
        image:     "<?php echo $image ?>",
        help:      "Additional instructions will appear here.",
        helpImage: "<?php getHelpImage() ?>",
        id:        "Thing2",
        active:    true
    }, {
        title:     "Your Bracket",
        image:     "<?php echo $image ?>",
        help:      "Additional instructions will appear here.",
        helpImage: "<?php getHelpImage() ?>",
        id:        "Thing3",
        active:    false
    }, {
        title:     "Your Bracket",
        image:     "<?php echo $image ?>",
        help:      "Additional instructions will appear here.",
        helpImage: "<?php getHelpImage() ?>",
        id:        "Thing4",
        active:    false
    } ];

    displayLogos( logos );

    function displayLogos( logos ) {
        let logosDiv = id('logos');
        for ( let i = 0; i < logos.length; i++ ) {
            let logoDiv = document.createElement( "DIV" );
            logoDiv.id = "logo" + i;
            logoDiv.style.margin = "0 3em 2em";
            logoDiv.classList.add( "title" );
            logoDiv.classList.add( "center" );
            logosDiv.appendChild( logoDiv );
            createTitleLogo( logos[i], logoDiv );

            if ( !logos[i].active ) {
                logoDiv.style.filter = "grayscale(1)";
            }
        }
    }
</script>
<?php includeModals(); ?>
</html>