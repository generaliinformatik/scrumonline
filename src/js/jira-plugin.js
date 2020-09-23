/*globals scrum */

// Add a plugin to load tickets from local JIRA server
scrum.sources.push({
  // Fixed properties and methods
  name: "JIRA",
  position: 3,
  view: "templates/jira_source.html",
  feedback: false,
  jql: 'AND issuetype in ("User Story", "Offener Punkt") ORDER BY Rank ASC',
  disable_jira_fields: false,
  // Feedback call for completed poll
  completed: function (result) {
  },

  // Custom properties and methods
  loaded: false,
  issues: [],
  issue: {},

  load: function () {
    var self = this;
    var queryParameters = null;

    if (this.base_url == null) {
      queryParameters = $.param({
        username: this.username,
        password: this.password,
        jql: this.jql
      });
    } else {
      queryParameters = $.param({
        base_url: this.base_url,
        username: this.username,
        password: this.password,
        project: this.project,
        jql: this.jql
      });
    }


    this.parent.$http({
      url: '/api/jira/getIssues',
      method: 'POST',
      data: queryParameters,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
        .then(function (response) {
          var data = response.data;

          if (!data || !data.issues) {
            self.error = 'Can\'t load Jira issues, check configuration';
          } else {
            var converter = new showdown.Converter();
            // Convert JIRA format to Markdown and then to HTML
            response.data.issues.forEach(function (issue) {
              var markdown = J2M.toM(issue.fields.description || '');
              issue.fields.description = converter.makeHtml(markdown);
            });
            self.base_url = response.data.base_url;
            self.story_point_field_name = response.data.story_point_field_name;
            self.issues = response.data.issues;
            self.issue = self.issues[0];
            self.loaded = true;
          }
        });
  },
  reload: function () {
    this.loaded = false;
  },

  jira_transfare: function (key, us) {
    var self = this;

    var queryParameters = $.param({
      issu_key: key,
      storypoints: us,
      username: this.username,
      password: this.password
    });

    this.parent.$http({
      url: '/api/jira/setStoryPoints',
      method: 'POST',
      data: queryParameters,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
        .then(function (response) {
          var data = response.data;
          if (!data) {
            self.error = 'Can\'t Update Jira Story Points';
          } else {
            self.issue.fields[self.story_point_field_name] = us;
          }
          document.getElementById("storypoints").value = null;
        });
  }
});
