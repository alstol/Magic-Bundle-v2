// ==UserScript==
// @name         The West Magic
// @version      2.4
// @description  Because magic is awesome!
// @author       Alin Stefan Olaru
// @website      https://alinstefanola.ru
// @include      *.the-west.*/game.php*
// @downloadURL  https://alinstefanola.ru/userscripts/magic.user.js
// @updateURL    https://alinstefanola.ru/userscripts/magic.user.js
// @grant        none
// ==/UserScript==

/*
    COPYRIGHT
    End users are licensed the right to download the code into their web browser(s) for standard and reasonable usage only.
    If you want the script translated, you shall contact the script owner for this.
*/
var script = document.createElement('script');
script.type = 'text/javascript';
script.textContent = '(' + (function() {
    /*
     * Building an object containing all the features and it's data.
     * @type {Object}
     */
    var MagicFeatures = {
        'notifications': {
            'status': '',
            'iconURL': 'https://westzz.innogamescdn.com/images/interface/chat/chat.gif',
            'releaseDate': '16th September 2014',
            'fullName': 'Better Notifications',
            'description': 'A simple userscript that displays a notification every time you get a new private message. Please allow the notifications to be displayed otherwise this feature will not work.'
        },
        'veteran': {
            'status': '',
            'iconURL': 'https://puu.sh/gdsek/93e29796d4.png',
            'releaseDate': '16th September 2014',
            'fullName': 'Veteran Point Counter',
            'description': 'A simple display of your amount of veteran points, placed conveniently under the top bar.'
        },
        'taskkiller': {
            'status': '',
            'iconURL': 'https://puu.sh/gdsnY/ecb27d9300.png',
            'releaseDate': '21th September 2014',
            'fullName': 'Task Killer',
            'description': 'A perfect script for lazy people (Like the guy that made this userscript). Tired of clicking 9 times to cancel your jobs? No problem! Just press the button placed on the left of the queued jobs, and all your jobs will be gone! It\'s MAGIC!'
        },
        'jobdesign': {
            'status': '',
            'iconURL': 'https://westzz.innogamescdn.com/images/icons/hammer.png',
            'releaseDate': '31st October 2014',
            'fullName': 'Job Window Re-Design',
            'description': 'An another script for lazy people! This userscript will replace the counter inside the job window, with a custom dropdown! How amazing is that?'
        },
        'multipurchase': {
            'status': '',
            'iconURL': 'https://puu.sh/lfvxl/187895d35c.png',
            'releaseDate': '10th November 2015',
            'fullName': 'Multi-Purchase',
            'description': 'A simple userscript that will allow you to purchase multiple items from the store! Amounts bigger than 27 will suffer a delay, in order to avoid flood protection.</i> <br> Kudos to <a href="https://forum.the-west.net/member.php?u=11236" target="_blank">Slygoxx</a> for helping.'
        },
        'neonxpbar': {
            'status': '',
            'iconURL': 'https://zz1.beta.the-west.net/images/icons/star.png',
            'releaseDate': '9th April 2016',
            'fullName': 'Rainbow Experience Bar',
            'description': 'Tired of the old boring yellow experience bar? Enable this feature, reload the game, and enjoy your brand new "rainbow" experience bar!'
        }
    };

    /*
     * It activates a certain feature, chosen by it's key.
     * @param {String} key
    */
    var enableFeature = function(key) {
        switch (key) {
            case "notifications":
                enableNotifications();
                break;
            case "veteran":
                enableVPCounter();
                break;
            case "taskkiller":
                enableTaskKiller();
                break;
            case "jobdesign":
                enableJobRework();
                break;
            case "multipurchase":
                if(Game.locale !== 'de_DE')
                    enableMultiPurchase();
                break;
            case "neonxpbar":
                enableNeonXP();
                break;
        }
    }

    /*
     * It enables the multi-purchase feature. This feature allows the user to purchase multiple items from the shops.
    */
    var enableMultiPurchase = function() {
        var loadingScreen = $('<div></div>').attr('id', 'xsht_load_screen').css({
            'position': 'absolute',
            'top': '0px',
            'left': '0px',
            'height': '100%',
            'width': '100%',
            'z-index': '100',
            'display': 'none'
        });
        $('body').append(loadingScreen);
        var progressBar = new west.gui.Progressbar(0, 100);
        Trader.amountChanged = function() {
            var totalPrice = $('#xsht_item_buy_amount').val() * $('#xsht_item_price').text();
            $('#xsht_total_price').text('$ ' + totalPrice);
            if (totalPrice > Character.deposit + Character.money) {
                $('#xsht_total_price').css({
                    'color': 'red',
                    'font-weight': 'bold'
                });
                $('.tw2gui_dialog_actions .tw2gui_button .textart_title:contains("Yes")').parent().fadeOut();
            } else {
                $('#xsht_total_price').css({
                    'color': 'black',
                    'font-weight': 'normal'
                });
                $('.tw2gui_dialog_actions .tw2gui_button .textart_title:contains("Yes")').parent().fadeIn();
            }
        }
        var buyStatusText = "All the products were bought.";
        var buyStatus = UserMessage.TYPE_SUCCESS;
        Trader.initProgress = function(bar) {
            $('#xsht_load_screen').html('<div id="xsht_load_screen"></div>');
            var barContainer = $('<div></div>').attr('id', 'xsht_bar_container').append(bar.getMainDiv());
            $('#xsht_load_screen').append(barContainer);
            $('#xsht_load_screen').fadeIn();
            if (bar.maxValue > 1)
                new UserMessage("Started buying " + bar.maxValue + " products! Please wait until the process is completed.", UserMessage.TYPE_ERROR).show();
            $('#xsht_load_screen .tw2gui_progressbar_progress').append("<span id='xsht_bar_timer' style=\"z-index: 2; right: 5px; top: 0; bottom: 0; position: absolute; color: white; font-size: 12px;line-height: 19px;text-shadow: black 1px 1px 1px;\">1:00</span>");
            Trader.startTime = new Date().getTime() / 1000;
        }

        Trader.increaseProgress = function() {
            progressBar.increase(1);
            if (progressBar.value == progressBar.maxValue) {
                $('#xsht_load_screen').fadeOut();
                if (progressBar.maxValue > 1)
                    new UserMessage(buyStatusText, buyStatus).show();
            }
            Trader.updateTimer();
        }

        Trader.buy_popup_xhtml = '<div class="bag_item float_left"><img src="%buy_img%" /></div>' + '<span class="item_popup_sell_value">' + 'Single Purchase price:'.escapeHTML() + '$ <span id="xsht_item_price">%buy_popup_price%</span></span><br />' + '<span style="font-size:12px;">' + 'Are you sure you want to purchase this item?'.escapeHTML() + '<br>Amount: ' + '<span class="tw2gui_textfield"><span><input type="number" id="xsht_item_buy_amount" value="1" min="1" max="2147483647" style="width:75px" onchange="Trader.amountChanged()" onkeyup="Trader.amountChanged()"><span class="search_lable_span" style="display: none;">Amount</span></span></span>' + '<div id="xsht_total_price_desc" style="font-size:12px;">Total price: <span id="xsht_total_price">$ %buy_popup_price%</span></div>' + '</span>';
        Trader.buyDialog = function(item_id) {
            var buy_popup;
            if ($('#buy_popup')) {
                $('#buy_popup').remove();
            }
            buy_popup = $('<div id="buy_popup" style="opacity: 0.9;"></div>');
            var item = Trader.getItemByItemId(item_id);
            if (item) {
                var html = Trader.buy_popup_xhtml.fillValues({
                    buy_img: item.getImgEl()[0].src,
                    buy_popup_price: item.getBuyPrice(),
                    buy_popup_item_name: item.getName()
                });
                var coords = $(Trader.window.divMain).position();
                new west.gui.Dialog(item.getName(), html).setX(coords.left).setY(coords.top).addButton('yes', function() {
                    var totalAmount = $('#xsht_item_buy_amount').val();
                    progressBar = new west.gui.Progressbar(0, totalAmount);
                    Trader.initProgress(progressBar);
                    for (var i = 0; i < totalAmount; i++)
                        if ($('#xsht_item_buy_amount').val() > 27)
                            setTimeout(Trader.buyItem, i * 1000, item);
                        else
                            Trader.buyItem(item);
                }).addButton('no', function() {
                    Trader.cancelBuy();
                }).setModal(true, true).show();
            }
        };

        Trader.buyItem = function(item) {
            item.getImgEl().css('opacity', '0.3');
            Ajax.remoteCall(Trader.types[Trader.type], 'buy', {
                item_id: item.obj.item_id,
                town_id: Trader.id,
                last_inv_id: Bag.getLastInvId()
            }, function(json) {
                if (json.error) {
                    buyStatusText = json.error;
                    buyStatus = UserMessage.TYPE_ERROR;
                    Trader.increaseProgress();
                    return new UserMessage(json.error, UserMessage.TYPE_ERROR).show();
                } else {
                    if (json.expressoffer) {
                        if (progressBar.maxValue == 1)
                            Premium.confirmUse(json.expressoffer + " " + Bag.getLastInvId(), 'Express delivery', "You aren\'t currently in this town. But this item can be delivered to you immediately for a few nuggets.", json.price);
                        buyStatusText = "You are not in the town!"
                        buyStatus = UserMessage.TYPE_ERROR;
                        Trader.increaseProgress();
                    } else {
                        Trader.handleBuyResponse(json);
                        buyStatusText = "All the products were bought.";
                        buyStatus = UserMessage.TYPE_SUCCESS;
                        if (Trader.type == "item_trader") {
                            item.divMain.remove();
                        }
                    }
                }
                item.getImgEl().css('opacity', '1.0');
                Trader.increaseProgress();
            });
            Trader.cancelBuy();
        };

        Trader.updateTimer = function() {
            var averageTime = (new Date().getTime() / 1000 - Trader.startTime) / progressBar.value;
            var remainingTime = averageTime * (progressBar.maxValue - progressBar.value);
            var minutes = parseInt(remainingTime / 60) % 60;
            var seconds = Math.round(remainingTime % 60);
            $("#xsht_load_screen #xsht_bar_timer").html(minutes + ":" + (seconds < 10 ? "0" + seconds : seconds));
        };
    }

    /*
     * It enables the task-killer. This feature allows the user to cancel all the queued jobs.
    */
    var enableTaskKiller = function() {
        var icon = $('<div></div>').attr({
            'title': "Cancel all jobs",
            'class': 'menulink'
        }).css({
            'background': 'url(http://puu.sh/bKC6c/ffbdf2ca37.jpg)',
            'background-position': '0px 0px'
        }).mouseleave(function() {
            $(this).css("background-position", "0px 0px");
        }).mouseenter(function(e) {
            $(this).css("background-position", "25px 0px");
        }).click(function() {
            var n = TaskQueue.queue.length;
            for (i = 0; i < n; i++) {
                TaskQueue.cancel(i);
            }
        });

        var fix = $('<div></div>').attr({
            'class': 'menucontainer_bottom'
        });

        $("#toggleTaskQueue").append($('<div></div>').attr({
            'class': 'ui_menucontainer',
            'id': 'taskKiller'
        }).css({
            "position": "relative",
            "right": "125px",
            "top": "30px",
            "z-index": "-1"
        }).append(icon).append(fix));
    }

    /*
     * It enables the "Neon" Experience bar, that changes color constantly.
    */
    var enableNeonXP = function() {
        var deg = 10;
        var adder = 5;
        var run = true;
        var hue = function() {
            $('#ui_experience_bar .fill_wrap .fill').css({
                '-webkit-filter': 'hue-rotate(' + deg % 361 + 'deg)',
                'filter': 'hue-rotate(' + deg % 361 + 'deg)'
            });
            deg += adder;
            if (run)
                setTimeout(hue, 50);
        }
        hue();
    }

    /*
     * It enables the Veteran Point counter. A convenient counter placed under the topbar, that displays the amount of VPs you have.
    */
    var enableVPCounter = function() {
        var valText = $('<span>').css({
            'position': 'absolute',
            'right': '5px',
            'text-shadow': '1px 1px 1px #000'
        }).attr('id', 'magic_vp_value').text('0');

        var vetIcon = $('<span>').attr('class', 'tw-currency curr-veteran').css({
            'position': 'absolute',
            'left': '0px'
        });

        var vetValue = $('<div>').attr('class', 'value').css({
            'position': 'absolute',
            'left': '32px',
            'top': '3px',
            'width': '115px',
            'height': '25px',
            'line-height': '25px',
            'pading': '0 5px',
            'color': '#f8c57c',
            'font-size': '13pt',
            'text-align': 'right',
            'user-select': 'none',
            'background': 'url("https://westzzs.innogamescdn.com/images/interface/custom_unit_counter_sprite.png?2") no-repeat 0 -36px',
            'z-index': '1'
        }).append(valText).prepend(vetIcon);

        var vetCounter = $('<div>').attr({
            'class': 'xsht_custom_unit_counter',
            'id': 'magic_vp_counter',
            'title': '<b>Veteran Points</b> <br>You earn Veteran Points by fighting on Adventures! <br>Veteran points can be spent in the Union Pacific Store.'
        }).css({
            'position': 'absolute',
            'top': '32px',
            'left': '50%',
            'margin-left': '-250px',
            'z-index': '16',
            'width': '180px',
            'height': '36px',
            'text-align': 'left',
            'text-shadow': '1px 1px 1px #000',
            'background': 'url("https://westzzs.innogamescdn.com/images/interface/custom_unit_counter_sprite.png?2") no-repeat 50% 0',
            'cursor': 'pointer'
        }).append(vetValue).click(function() {
            west.window.shop.open();
        });

        $("#ui_topbar").before(vetCounter)
        WestUi.TopBar._redraw($("#magic_vp_value"), Character.veteranPoints);
        EventHandler.listen("veteran_points_changed", function(amount) {
            WestUi.TopBar._redraw($("#magic_vp_value"), Character.veteranPoints);
        });
    }

    /*
     * It replaces the +/- button inside the job window with a dropdowon.
    */
    var enableJobRework = function() {
        JobWindow.getJobAmount = function() {
            var amount = parseInt(this.window.$("#tw_work_menu_value").children("option").filter(":selected").text(), 10);
            return isNaN(amount) ? 1 : amount;
        };

        JobWindow.getJobAmountSelector = function() {
            var title = _('How often do you want to start the job?').escapeHTML(),
                cb = this.setJobAmount.bind(this);
            return $(s('<div style="position:relative;top:-50px;left:20px;" title="%1">' +
                '<select id="tw_work_menu_value">' + '      <option value="1">1</option>' + '      <option value="2">2</option>' + '      <option value="3">3</option>' + '      <option value="4">4</option>' + '      <option value="5">5</option>' + '      <option value="6">6</option>' + '      <option value="7">7</option>' + '      <option value="8">8</option>' + '      <option value="9">9</option>' + '    </select> ' +
                '</div>', title)).click(cb).mousewheel(cb);
        };
    }


    /*
     * It sends a request to the user to enable the browser notifications.
    */
    var requestNotification = function() {
        if (!window.Notification) {
            new UserMessage("Sorry, notifications are not supported.").show();
        } else {
            Notification.requestPermission(function(p) {
                if (p === 'denied') {
                    new UserMessage("Permission wasn\'t granted.").show();
                } else if (p === 'granted') {
                    new UserMessage("Notifications have been enabled!").show();
                }
            });
        }
    }
    /*
     * For some reason displaying coloured message brings out some HTML tags as well. Using this to remove them.
     */
    var stripHTML = function(html)
    {
       var tmp = document.createElement("DIV");
       tmp.innerHTML = html;
       return tmp.textContent || tmp.innerText || "";
    }

    /*
     * It enables the better-notifications feature. This feature replaces the standard in-game popup.
    */
    var enableNotifications = function() {
        /*Keeping this here for later.
        var emotes = {
            "sore": ":/",
            "invader": "=:)",
            "angry": ">:(",
            "cry": ":'(",
            "smile": ":)",
            "grin": ":D",
            "frown": ":(",
            "smirk": ";)",
            "tongue": ":P",
            "ohmy": ":o",
            "muted": ":x",
            "silent": ":|",
            "palm": ">_<",
            "nc": "-.-",
            "happy": "^_^",
            "oo": "o_O",
            "xx": "x_x",
            "cry": "T_T",
            "elpollodiablo": "el pollo diablo!",
            "elpollodiablo_mirror": "!el pollo diablo",
            "elpollodiablo_front": "el pollo diablo?!"
        };*/
        requestNotification();
        EventHandler.listen("chat_tell_received", function(room) {
            function notify() {
                var regex = /<td(.*)chat_text(.*?)>(.*)<\/td>/ig;
                var final = regex.exec(room.history[room.history.length - 1])[3];
                new Notification('New Message from ' + room.client.pname, {
                    body: stripHTML(final.replace(/<img.*?>/g, "")),
                    icon: 'http://puu.sh/oaqQS/1c5bbb0c5c.jpg'
                });
            }

            if (Notification.permission !== 'granted')
                new UserMessage("Please enable notifications.").show();
            else
                notify();
        });
    }

    /*
     * Creating a local storage if it doesn't exist. If there is one, I'm updating the MagicFeatures objects with data from it.
     */
    var initialiseStorage = function() {
        $.each(MagicFeatures, function(key) {
            if (localStorage.getItem("magicbundle_feature_" + key) === null) {
                localStorage.setItem("magicbundle_feature_" + key, "deactivated");
                MagicFeatures[key]["status"] = "deactivated";
            } else if (localStorage.getItem("magicbundle_feature_" + key) === "activated") {
                MagicFeatures[key]["status"] = "activated";
                enableFeature(key);
            } else if (localStorage.getItem("magicbundle_feature_" + key) === "deactivated") {
                MagicFeatures[key]["status"] = "deactivated";
            }
        })
    }



    /*
     * Changing the status of a feature, from deactivated to activated and the other way around.
     * @param {String} key
     */
    var changeFeatureStatus = function(key) {
        var s1 = MagicFeatures[key]['status'];
        var s2 = localStorage.getItem('magicbundle_feature_' + key);
        if (s1 != s2) {
            return "Error"; //Should never happen, hopefully.
        } else {
            if (s1 == "activated") {
                new UserMessage("'" + MagicFeatures[key]["fullName"] + "' is now disabled.").show();
                MagicFeatures[key]['status'] = "deactivated";
                localStorage.setItem('magicbundle_feature_' + key, "deactivated");
            } else {
                new UserMessage("'" + MagicFeatures[key]["fullName"] + "' is now enabled.").show();
                MagicFeatures[key]['status'] = "activated";
                localStorage.setItem('magicbundle_feature_' + key, "activated");
            }
        }
    }

    /*
     * Building a window object, setting the initial tab to "notifications"
     * @type {Object}
     */
    window.MagicWindow = {
        window: null,
        currentTab: "notifications",
    };

    /*
     * Manually injecting some styling to the game. Don't ever do this pls.
    */
    var styling = '<style>.activated { background-position: -49px !important;  } </style>';
    $('head').append(styling);

    /*
     * Building a Table Row containing the Toggle Buttom
     * @param {String} key
     * @param {String} status
     * @returns {HTMLTableRow}
     */
    var buildToggleTableRow = function(key, status) {
        var tColOne = $('<td>').text('Toggle: ').css('font-weight', 'bold');
        var toggleButton = $('<div>').attr({
            'id': 'xsht-toggle-' + key,
            'class': 'xsht-button ' + status
        }).css({
            'width': '50px',
            'height': '17px',
            'border-radius': '20px',
            'background-image': 'url("https://puu.sh/o9HHe/afc2d04137.png")',
            'background-size': '114px 18px',
            'background-position': '-17px',
            'transition': 'background-position 0.5s'
        }).click(function() {
            $(this).toggleClass('activated');
            changeFeatureStatus(key);
        });

        var tColTwo = $('<td>').append(toggleButton);
        var tRow = $('<tr>').append(tColOne).append(tColTwo);
        return tRow;
    }

    /*
     * Building a Table Row containing the release date of the feature
     * @param {String} date
     * @returns {HTMLTableRow}
     */
    var buildReleaseDateRow = function(date) {
        var tColOne = $('<td>').text('Release Date: ').css('font-weight', 'bold');
        var tColTwo = $('<td>').text(date);
        var tRow = $('<tr>').append(tColOne).append(tColTwo);
        return tRow;
    }

    /*
     * Building a Table Row containing the description of the feature
     * @param {String} data
     * @returns {HTMLTableRow}
     */
    var buildDescriptionRow = function(data) {
        var tColOne = $('<td>').attr('colspan', 2).html(data).css({
            'font-style': 'italic',
            'padding-top': '10px'
        });
        var tRow = $('<tr>').append(tColOne);
        return tRow;
    }

    /*
     * Building a Table Row containing a warning informing the user that he should reload the game
     * @returns {HTMLTableRow}
     */
    var buildWarningRow = function() {
        var tColOne = $('<td>').attr('colspan', 2).css({
            'font-weight': 'bold',
            'color': 'red'
        }).text("Please reload the game in order to apply the changes!");
        var tRow = $('<tr>').append(tColOne);
        return tRow;
    }

    /*
     * Generating and opening the window. Eventually, you can open the window at a certain tab, otherwise it'll open at the most recent visited.
     * @param {String} tab
     */
    MagicWindow.open = function(tab) {
        if (undefined === tab) tab = this.currentTab;
        var tabclick = function(win, id) {
            MagicWindow.showTab(id);
        }

        MagicWindow.window = wman.open("magicwindow", "Magic Window").setMiniTitle("Magic Window").setSize(420, 370);

        $.each(MagicFeatures, function(key) {
            var contentTable = $('<table>').css('padding-top', '10px');
            contentTable.append(buildToggleTableRow(key, MagicFeatures[key]["status"]));
            contentTable.append(buildReleaseDateRow(MagicFeatures[key]["releaseDate"]));
            contentTable.append(buildDescriptionRow(MagicFeatures[key]["description"]));
            contentTable.append(buildWarningRow());
            var par = $('<div>').attr({
                'class': 'magic-content',
                'id': 'magic-' + key,
                'display': 'none'
            }).html(contentTable);
            if(key === 'multipurchase' && Game.locale === 'de_DE')
                console.log('MultiPurchase is apparently not legal on the German Server. Sorry! <3');
            else
                MagicWindow.window.addTab('<img src="' + MagicFeatures[key]["iconURL"] + '">', key, tabclick).appendToContentPane(par);     
        });

        this.showTab(tab);
    };

    /*
     * Using this method to change between the active tabs, for the window. Should not be ran unless the window is open.
     * @param {String} id
     */
    MagicWindow.showTab = function(id) {
        if (!this.window) return;
        this.currentTab = id;
        this.window.activateTab(id);
        $.each($('#magic-' + id).parent().children(), function() {
            var elID = $(this).attr('id');
            if (elID != "magic-" + id)
                $(this).hide();
            else
                $(this).slideDown('1000');
        });
        this.window.setTitle(MagicFeatures[id]["fullName"]);
        this.window.setMiniTitle(MagicFeatures[id]["fullName"]);

    };

    /*
     * Creating a button used to open the window.
     */
    var initialiseButton = function() {
        var icon = $('<div></div>').attr({
            'title': 'Magic Menu',
            'class': 'menulink'
        }).css({
            'background': 'url("http://puu.sh/gbV7X/4703da6942.png")',
            'background-position': '0px 0px'
        }).mouseleave(function() {
            $(this).css("background-position", "0px 0px");
        }).mouseenter(function(e) {
            $(this).css("background-position", "25px 0px");
        }).click(function() {
            MagicWindow.open('notifications');
        });

        var cap = $('<div></div>').attr({
            'class': 'menucontainer_bottom'
        });

        $("#ui_menubar").append($('<div></div>').attr({
            'class': 'ui_menucontainer',
            'id': 'magicbundle_init_button'
        }).append(icon).append(cap));
    }

    /*
     * Registering the userscript to the game API.
    */
    var registerToWestApi = function() {
        scriptInfo = "<h1>Features:</h1>";
        $.each(MagicFeatures, function(key) {
            scriptInfo += "<li><b>" + MagicFeatures[key]["fullName"] + "</b>: ";
            if(MagicFeatures[key]["status"] === "activated") {
                scriptInfo += "<span style='color:green;'>" + MagicFeatures[key]["status"] + "</span></br>";
            } else {
                scriptInfo += "<span style='color:red;'>" + MagicFeatures[key]["status"] + "</span></br>";
            }
        });
        scriptInfo += "<h1>Originally built by xShteff</h1>";
        scriptInfo += "<p><b>If you want to contribute to any of my scripts you are welcome to contact me on GitHub.</b></p>";

        window.scriptyscript = {
            script: TheWestApi.register('twmagicbundle', 'The West Magic', '2.1', Game.version.toString(), 'xShteff', 'https://xshteff.github.io'),
            setGui: function() {
                this.script.setGui(scriptInfo);
            },
            init: function() {
                this.setGui();
            }
        };
        window.scriptyscript.init();
    }

    /*
     * Initialising the localstorage, registering the script to the API and adding the button.
     */
    var initialiseScript = function() {
        initialiseStorage();
        registerToWestApi();
        initialiseButton();
    }

    initialiseScript();
}).toString() + ')()';
document.head.appendChild(script);
