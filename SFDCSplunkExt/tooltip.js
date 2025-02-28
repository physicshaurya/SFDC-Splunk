 $(window).load(function(){
        $('body').on("click", "#view_runTimes", function() {
            var $this = $(this);
            $("#background").css({
                "opacity": "0"
            });


            $("#large").html(function() {
                $('.ttip1').css({
                    right: $this.position() + '20px',
                    bottom: $this.position() + '50px'
                }).show(0)

            }).fadeIn(200);

        });

        $('body').on("mouseleave", ".ttip1", function() {
            $("#background").fadeOut(300);
            $("#large").fadeOut(300);

        });

        $('body').on("click", "#view_gacksPanel", function() {
            var $this = $(this);
            $("#background").css({
                "opacity": "0"
            });


            $("#largeGack").html(function() {
                $('.ttipGack').css({
                    right: $this.position() + '20px',
                    bottom: $this.position() + '50px'
                }).show(0)

            }).fadeIn(200);

        });

        $('body').on("mouseleave", ".ttipGack", function() {
            $("#background").fadeOut(300);
            $("#largeGack").fadeOut(300);

        });

        $('body').on("click", "#view_advanced", function() {
            var $this = $(this);
            $("#background").css({
                "opacity": "0"
            });


            $("#largeAdv").html(function() {
                $('.ttipAdv').css({
                    right: $this.position() + '20px',
                    bottom: $this.position() + '50px'
                }).show(0)

            }).fadeIn(200);

        });
        
        $('body').on("mouseleave", ".ttipAdv", function() {
            $("#background").fadeOut(300);
            $("#largeAdv").fadeOut(300);

        });
     
        $('body').on("click", "#view_verfPanel", function() {
            var $this = $(this);
            $("#background").css({
                "opacity": "0"
            });


            $("#largeVerf").html(function() {
                $('.ttipVerf').css({
                    right: $this.position() + '20px',
                    bottom: $this.position() + '50px'
                }).show(0)

            }).fadeIn(200);

        });

        $('body').on("mouseleave", ".ttipVerf", function() {
            $("#background").fadeOut(300);
            $("#largeVerf").fadeOut(300);

        });

        $('body').on("click", "#view_emailPanel", function() {
            var $this = $(this);
            $("#background").css({
                "opacity": "0"
            });


            $("#largeEmail").html(function() {
                $('.ttipEmail').css({
                    right: $this.position() + '20px',
                    bottom: $this.position() + '50px'
                }).show(0)

            }).fadeIn(200);

        });

        $('body').on("mouseleave", ".ttipEmail", function() {
            $("#background").fadeOut(300);
            $("#largeEmail").fadeOut(300);

        });

        $('body').on("click", "#view_wavePanel", function() {
            var $this = $(this);
            $("#background").css({
                "opacity": "0"
            });


            $("#largeWave").html(function() {
                $('.ttipWave').css({
                    right: $this.position() + '20px',
                    bottom: $this.position() + '50px'
                }).show(0)

            }).fadeIn(200);

        });

        $('body').on("mouseleave", ".ttipWave", function() {
            $("#background").fadeOut(300);
            $("#largeWave").fadeOut(300);

        });
     
        $('body').on("click", "#view_reportPanel", function() {
            var $this = $(this);
            $("#background").css({
                "opacity": "0"
            });


            $("#largeReport").html(function() {
                $('.ttipReport').css({
                    right: $this.position() + '20px',
                    bottom: $this.position() + '50px'
                }).show(0)

            }).fadeIn(200);

        });

        $('body').on("mouseleave", ".ttipReport", function() {
            $("#background").fadeOut(300);
            $("#largeReport").fadeOut(300);

        });
     
});