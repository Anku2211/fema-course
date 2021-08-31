define(["backbone", "core/js/adapt", "../libraries/jquery-ui"], function (Backbone, Adapt, jqueryUI) {
  var reviewDes;
  var previousReviewData;
  var review;
  var modeUrl = "http://localhost:5000"; // set to blank for production
  var courseId;

  var ReviewModel = Backbone.Model.extend({
    idAttribute: "_id",
    urlRoot: `${modeUrl}/review`,
  });

  var ReviewCollection = Backbone.Collection.extend({
    model: ReviewModel,
    urlRoot: `${modeUrl}/review`,
    url: function () {
      var url = `${this.urlRoot}/${this.courseId}`;
      return url;
    },
    initialize: function (props) {
      this.courseId = props.courseId;
    },
  });

  function setupReview(courseId) {
    new ReviewCollection({ courseId: courseId }).fetch({
      success: function (reviewComments) {
        var view = new ReviewView({ collection: reviewComments });
      },
    });
  }

  function initReview() {
    var review = Adapt.course.get("_review");
    courseId = Adapt.config.get("_courseId");
    // TODO: Add a check based on _status field as well i.e. Adapt.course.get('_status') === 'review'
    if (!review || review._isEnabled === false) return;
    console.log(courseId);

    setupReview(courseId);
  }

  var ReviewView = Backbone.View.extend(
    {
      className: "review",

      events: {},
      initialize: function () {
        this.listenTo(this.collection, "reset", this.render);
        this.render();
      },

      showReview: function () {
        var self = this;
        // console.log(self);
        $(function () {
          $("#tabs").tabs();
        });

        $(function () {
          var popup, form;

          function addedReview() {
            review = $("#review-input").val();
            reviewer = $("#reviewer").val();
            getPriority = $("#priority").val();
            $.ajax({
              url: `${modeUrl}/review`,
              type: "POST",
              data: {
                description: review,
                createdBy: reviewer || "Anonymous",
                courseId: courseId,
                priority: getPriority,
                createdAt: new Date().toLocaleString(),
                modifiedAt: new Date().toLocaleString(),
              },

              success: function (data) {
                console.log("Added review");
                console.log(data);
                console.log(data.description);
                self.collection.fetch({ reset: true });
              },
              error: function (data) {
                console.log("Getting an error on adding a review");
              },
            });
            $("#review-input").val(" ");
            $("#reviewer").val(" ");
          }

          popup = $("#tabs").dialog({
            title: "Review comments",
            autoOpen: false,
            height: 420,
            width: 760,
            modal: true,
            cancel: $(".cancel-btn").on("click", Cancel),
            add: $(".add-btn").on("click", addedReview),
            delete: $(".review-list-item a").on("click", deleteComment),
            close: function () {
              form[0].reset();
            },
          });
          function deleteComment(event, id) {
            var commentId = $(event.target).attr("data-id");
            var id = commentId;
            event && event.preventDefault();
            $(".review-comment").attr("contenteditable", "true");
            $(".review-comment").focus();
            $(".edit-review").hide();
            $(".save-review, .cancel-review").show();
            $(".save-review").on("click", function (e) {
              var updatedReview = '"' + $(".review-comment").html() + '"';
              console.log(updatedReview);
              updatedData = {
                description: updatedReview,
              };
              $(".review-comment").blur();
              $(".edit-review").show();
              $(".save-review, .cancel-review").hide();
              $.ajax({
                url: `${modeUrl}/review/${courseId}/${id}`,
                method: "PUT",
                data: updatedData,

                success: function () {
                  console.log("updatedted review");
                  // self.collection.fetch({ reset: true });
                  // setupReview();
                },
                error: function () {
                  console.log("Getting an error on updating a review");
                },
              });
            });

            // $.ajax({
            //   url: `${modeUrl}/review/${id}`,
            //   type: 'DELETE',

            //   success: function () {
            //     console.log('deleted review');
            //     self.collection.fetch({reset: true});
            //     // setupReview();
            //   },
            //   error: function () {
            //     console.log('Getting an error on deleting a review');
            //   },
            // });
          }
          function Cancel() {
            popup.dialog("close");
          }

          form = popup.find("form").on("submit", function (event) {
            event.preventDefault();
          });

          $("#addReview").on("click", function () {
            popup.dialog("open");
            $(".tab-list").css("border-bottom", "4px solid #007fff");
          });
        });
      },

      previousReview: function () {
        var self = this;
        console.log("Is this even called?!!!!!!!!!");
        $.ajax({
          url: `${modeUrl}/review/${courseId}`,
          type: "GET",
          success: function (data) {
            console.log("Previous review");
            previousReviewData = data;
          },
          error: function (data) {
            console.log("Getting an error on adding a review");
          },
        });
      },

      render: function () {
        var template = Handlebars.templates["review"];
        var modelData = this.collection.toJSON();
        if (modelData.length == 1 && modelData[0].hasOwnProperty("message")) {
          this.$el.html(template({ comments: null })).insertAfter("#wrapper");
          $("#tabs-2").empty().append(`<h1>No review comments received yet.</h1>`);
        } else {
          this.$el.html(template({ comments: this.collection.toJSON() })).insertAfter("#wrapper");
        }
        _.defer(_.bind(this.postRender, this));
        return this;
      },
      postRender: function () {
        console.log("Review");
        this.showReview();
        // this.previousReview();
      },
    },
    {
      template: "review",
    },
  );

  Adapt.on("adapt:start", initReview);
});
