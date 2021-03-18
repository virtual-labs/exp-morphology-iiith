$('#hidden-content').load('default.html #experiment',
                function(response, status, xhr) {
                    //loads the default.html #lab section into the
                    //#hidden-content

                    $('#container').load('content.html #experiment',
                        function(response, status, xhr) {
                            //loads the content.html #lab section into the
                            //#container

                            homePage = $("div#experiment-header-heading a").html();

                            thisPage = $("article#experiment-article header#experiment-article-heading").html();

                            breadcrumb = "<font color='white'>" + "<a href='../../index.html'>Home<a/> \> <a href='../index.html'>" + homePage + "</a> \> <a href='index.html'>" + thisPage + "</a>" + "</font>";

                            $("article#experiment-article div#experiment-article-breadcrumb").html(breadcrumb);

                            $("#container .default").each(function() {
                                // Extracts all elements with class = "default"
                                // and top down

                                sectionId = $(this).attr('id');
                                sectionContent = $("#hidden-content #" +
                                    sectionId).html();
                                $("#container #" + sectionId).html(sectionContent);
                            });

                            $("#container #experiment-article-sections > section").each(function() {
                                // loads all the content in the respective
                                // sections with the corresponding section headings 

                                sectionId = $(this).attr('id');
                                headerId = $("#" + sectionId + "-heading").html();
                                iconId = $("#" + sectionId + "-icon").html();

                                $("#container #experiment-article-navigation ul").
                                append("<li> <a href=\'#\' id=\'" + sectionId +
                                    "-menu\'>" + iconId + "<br />" +
                                    headerId + "</a></li>");
                            });

                            /*			
          $("#experiment-article-sections").after(
            "<div id='experiment-article-sections-view'> </div>");
	  $("#experiment-article-sections-view").html($(
            "#experiment-article-sections section:first").html()); */

                            $("#experiment-article-sections section").hide();
                            //hide all the experiment sections

                            $("#experiment-article-sections section:first").show();
                            //show only the first experiment section when
                            //the experiment page loads

                            $("#experiment-article-navigation ul > li a").live('click',
                                function() {
                                    //enables the navigation

                                    menuId = $(this).attr('id');
                                    // this points to the current element

                                    sectionId = menuId.replace(/-menu/i, "");
                                    /*
	    $("#experiment-article-sections-view").html($(
            "#experiment-article-sections #" + 
            sectionId).html());
	    */

                                    $("#experiment-article-sections section").hide();
                                    $("#experiment-article-sections #" + sectionId).show();
                                });
                        });
                });

        });

        var AddDel = new Array; //global variable to store the correct Add-Del table

        function checkCondition() { //checks your answer

            var par = document.getElementById("mySelection");
            theIndx = par.selectedIndex;

            answer = new Array(); //to store your answer
            answer[0] = document.getElementById("delsingdr").value;
            answer[1] = document.getElementById("delpludr").value;
            answer[2] = document.getElementById("delsingob").value;
            answer[3] = document.getElementById("delpluob").value;
            answer[4] = document.getElementById("addsingdr").value;
            answer[5] = document.getElementById("addpludr").value;
            answer[6] = document.getElementById("addsingob").value;
            answer[7] = document.getElementById("addpluob").value;

            cor_answers = document.getElementById("answer").value;

            cor_answers = cor_answers.split(" ");

            var ii = 0;
            flag = new Array(0, 0, 0, 0, 0, 0, 0, 0);
            flag1 = 0;
            paradigm = par.options[theIndx].value;
            var ind = (paradigm - 1) * 8 + (2 * paradigm);
            for (var i = ind; i < ind + 8; i++) {
                AddDel[ii] = cor_answers[i];
                //   document.write(AddDel[ii] + "<br>");
                ii++;
            }

            document.getElementById('check').innerHTML = '<b>Correction</b>';

            for (i = 0; i < 8; i++) {
                if (answer[i] != AddDel[i]) {
                    flag[i] = 1;
                    flag1 = 1;
                    document.getElementById('check' + i % 4).innerHTML = '<img src="wrong.png" height="25" width="25" alt="Wrong" /> ';

                } else if (flag[i - 4] != 1) //if the corresponding Add table is wrong dont overwrite
                    document.getElementById('check' + i % 4).innerHTML = '<img src="right.png" height="25" width="25" alt="Right" /> ';
            }

            if (flag1 == 1) {
                document.getElementById('result1').innerHTML = '<br/> <p style="font-family:arial;color:red;font-size:20px;"> Error in your Add-Delete table!</p> <br/> <br/> <form action="javascript:correctTable()" > <input type="submit" value="Get Answer" onsubmit="correctTable();" /> </form><br/>';
                document.getElementById('result2').innerHTML = ''; //clear previous value stored in this section

            } else {
                document.getElementById('result1').innerHTML = '<br/> <p style="font-family:arial;color:green;font-size:20px;"> Correct Answer! </p> <br/> <br/>';
                document.getElementById('result2').innerHTML = ''; //clear previous value stored in this section
                document.myform3.formvar.value = answer[0];
            }

        }

        function clearForm() //clears form on selecting a different root word
        {
            var i;
            document.getElementById('check').innerHTML = '';
            for (i = 0; i < 4; i++)
                document.getElementById('check' + i).innerHTML = '';
            document.getElementById("addsingdr").value = 'आ';
            document.getElementById("addpludr").value = 'आ';
            document.getElementById("addsingob").value = 'आ';
            document.getElementById("addpluob").value = 'आ';
            document.getElementById("delsingdr").value = 'आ';
            document.getElementById("delpludr").value = 'आ';
            document.getElementById("delsingob").value = 'आ';
            document.getElementById("delpluob").value = 'आ';
            document.getElementById('result2').innerHTML = '';
            document.getElementById('result1').innerHTML = '';
        }

        function correctTable() //prints the correct table
        {
            document.getElementById('result2').innerHTML = '<table cellspacing="-2" cellpadding="4" border="1" style="text-align:center;"><tr><th>Delete</th><th>Add</th><th>Number</th><th>Case</th></tr> <tr><td>' + AddDel[0] + '</td><td>' + AddDel[4] + '</td><td>sing</td><td>dr</td> </tr><tr><td>' + AddDel[1] + '</td><td>' + AddDel[5] + '</td><td>plu</td><td>dr</td> </tr><tr><td>' + AddDel[2] + '</td><td>' + AddDel[6] + '</td><td>sing</td><td>ob</td> </tr><tr><td>' + AddDel[3] + '</td><td>' + AddDel[7] + '</td><td>plu</td><td>ob</td> </tr></table>';

        }
    </script>

    <script>
        (function(i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function() {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date();
            a = s.createElement(o), m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
        ga('create', 'UA-67558473-1', 'auto');
        ga('send', 'pageview');
