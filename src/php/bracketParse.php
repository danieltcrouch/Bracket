<?php

function getLogoInfo()
{
    if ( $_GET['id'] )
    {
        if ( $_GET['id'] === "PREVIEW" && $_POST['logo'] )
        {
            echo json_encode( $_POST['logo'] );
        }
        else
        {
            //todo - get from Database
            if ( $_GET['id'] === "Marvel" )
            {
                echo "{
                    title: \"Marvel Bracket\",
                    image: \"https://img.cinemablend.com/filter:scale/cb/8/7/6/f/0/7/a876f07fdc693995a2d33e0252a297ba68c7e7c21b556aa99f2f31b66fd1adb0b.jpg?mw=600\",
                    help:  \"Vote for characters based on how cool they are.\",
                    id:     \"Marvel\",
                    active: true
                }";
            }
            else if ( $_GET['id'] === "DC" ) {
                echo "{
                    title:     \"DC Bracket\",
                    image:     \"https://nerdist.com/wp-content/uploads/2018/05/maxresdefault-1.jpg\",
                    help:      \"Vote for the most iconic.\",
                    id:        \"DC\",
                    active:    true
                }";
            }
            else if ( $_GET['id'] === "politicsRule" ) {
                echo "{
                    title:     \"Political Poll\",
                    image:     \"https://www.washingtonpost.com/resizer/1dHHVlrrcQBgN2IyYj1uPDkq_bA=/1484x0/arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/2UBQVEWXVRFCDJDNPHT4DPSMFM\",
                    help:      \"Vote on who would make the best leader of the free world.\",
                    id:        \"politicsRule\",
                    active:    false
                }";
            }
            else {
                echo "{
                    title:     \"Your Bracket\",
                    image:     \"https://www.fleetowner.com/sites/fleetowner.com/files/styles/article_featured_standard/public/uncle-sam-i-want-you.png?itok=pw0imgck\",
                    help:      \"Additional instructions will appear here.\",
                    id:        \"previewBracket\",
                    active:    true
                }";
            }
        }
    }
    else
    {
        echo "null";
    }
}

function getBracketInfo()
{
    if ( $_GET['id'] )
    {
        if ( $_GET['id'] === "PREVIEW" && $_POST['bracket'] )
        {
            echo json_encode( $_POST['bracket'] );
        }
        else
        {
            //todo - get from Database
            if ( $_GET['id'] === "Marvel" )
            {
                echo "{ active:  true,
                        endTime: null,
                        mode:    \"open\",
                        winners: \"\",
                        entries: [
                            { title: \"Spider-Man\", image: \"https://media.playstation.com/is/image/SCEA/marvels-spider-man-hero-banner-02-ps4-us-16jul18?$native_nt$\" },
                            { title: \"Iron Man\", image: \"https://cdn.images.express.co.uk/img/dynamic/36/590x/Avengers-Iron-Man-was-almost-played-by-another-major-star-936289.jpg\" },
                            { title: \"Captain America\", image: \"https://cnet2.cbsistatic.com/img/Em3tYAnRSeSVCJH84Lvgv-fThrQ=/1600x900/2017/08/03/75c3b0ae-5a2d-4d75-b72b-055247b4378f/marvelinfinitywar-captainamerica.jpg\" },
                            { title: \"Thor\", image: \"https://cdn.mcuexchange.com/wp-content/uploads/2018/06/thor.jpg\" },
                            { title: \"Black Panther\", image: \"http://cdn.shopify.com/s/files/1/1916/3081/products/product-image-544753420_1200x1200.jpg?v=1527307028\" },
                            { title: \"Doctor Strange\", image: \"https://cdn1us.denofgeek.com/sites/denofgeekus/files/styles/main_wide/public/2016/12/doctor-strange-2-benedict-cumberbatch.jpg?itok=jeAJwK4P\" },
                            { title: \"The Incredible Hulk\", image: \"https://i.ytimg.com/vi/jolXso_OO-c/maxresdefault.jpg\" }
                        ] }";
            }
            else if ( $_GET['id'] === "DC" ) {
                echo "{ active:  true,
                        endTime: \"In a little bit...\",
                        mode:    \"round\",
                        winners: \"\",
                        entries: [
                            { title: \"Superman\", image: \"https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/SupermanRoss.png/250px-SupermanRoss.png\" },
                            { title: \"Batman\", image: \"https://www.dccomics.com/sites/default/files/styles/comics320x485/public/Char_Thumb_Batman_20190116_5c3fc4b40fae42.85141247.jpg\" },
                            { title: \"The Flash\", image: \"https://vignette.wikia.nocookie.net/superheroes/images/2/24/Flash.jpg/revision/latest?cb=20140203094110\" },
                            { title: \"Wonder Woman\", image: \"https://assets.www.warnerbros.com/sites/default/files/movies/media/browser/wonder_woman_poster_lasso.jpg\" },
                            { title: \"Green Lantern\", image: \"https://www.dccomics.com/sites/default/files/HJFLC_Cv1_R3_gallery_57fc3635f2c6a2.45566872.jpg\" },
                            { title: \"Aquaman\", image: \"https://thumbor.forbes.com/thumbor/960x0/https%3A%2F%2Fblogs-images.forbes.com%2Finsertcoin%2Ffiles%2F2018%2F12%2Faqua2.jpg\" },
                            { title: \"Martian Manhunter\", image: \"https://upload.wikimedia.org/wikipedia/en/thumb/3/34/Martian_Manhunter_Alex_Ross.png/250px-Martian_Manhunter_Alex_Ross.png\" }
                        ] }";
            }
            else if ( $_GET['id'] === "politicsRule" ) {
                echo "{ active:  false,
                        endTime: null,
                        mode:    \"match\",
                        winners: \"\",
                        entries: [
                            { title: \"Joe Biden\" },
                            { title: \"Elizabeth Warren\" },
                            { title: \"Bernie Sanders\" },
                            { title: \"Pete Buttigieg\" },
                            { title: \"Kamala Harris\" },
                            { title: \"Cory Booker\" },
                            { title: \"Marianne Williamson\" }
                        ] }";
            }
            else {
                echo "{ active:  true,
                        endTime: null,
                        mode:    \"open\",
                        winners: \"\",
                        entries: [
                           { title: \"A\" },
                           { title: \"B\" },
                           { title: \"C\" },
                           { title: \"D\" },
                           { title: \"E\" },
                           { title: \"F\" },
                           { title: \"G\" },
                           { title: \"H\" },
                           { title: \"I\" },
                           { title: \"J\" },
                           { title: \"K\" },
                           { title: \"L\" },
                           { title: \"M\" },
                           { title: \"N\" },
                           { title: \"O\" },
                           { title: \"P\" },
                           { title: \"Q\" },
                           { title: \"R\" },
                           { title: \"S\" },
                           { title: \"T\" },
                           { title: \"U\" },
                           { title: \"V\" },
                           { title: \"W\" },
                           { title: \"X\" },
                           { title: \"Y\" },
                           { title: \"Z\" },
                           { title: \"AA\" },
                           { title: \"AB\" },
                           { title: \"AC\" },
                           { title: \"AD\" },
                           { title: \"AE\" },
                           { title: \"AF\" },
                           { title: \"AG\" },
                           { title: \"AH\" },
                           { title: \"AI\" },
                           { title: \"AJ\" },
                           { title: \"AK\" },
                           { title: \"AL\" },
                           { title: \"AM\" }
                        ] }";
            }
        }
    }
    else
    {
        echo "null";
    }
}

?>