<?php

use JiraRestApi\Configuration\ArrayConfiguration;
use JiraRestApi\Issue\IssueService;
use JiraRestApi\Issue\IssueField;
use JiraRestApi\JiraException;

/*
 * Jira controller class to handle all Jira operations
 */

class JiraController extends ControllerBase
{

    public function getIssues()
    {
        $parameters = array_replace_recursive($this->jiraConfiguration, $_POST);
        $jql = $parameters['jql'];

        $CurrentIssueService = new IssueService(new ArrayConfiguration(
            array(
                'jiraHost' => $parameters['base_url'],
                'jiraUser' => $parameters['username'],
                'jiraPassword' => $parameters['password']
            )
        ));

        if ($parameters['project'] !== null and $parameters['jql'] !== null) {
            $jql = 'project = ' . $parameters['project'] . ' ' . $parameters['jql'];
        }

        try {
            $ret = $CurrentIssueService->search($jql, 0, $parameters['issue-limit']);
            $ret->story_point_field_name = $this->jiraConfiguration['story_point_field_name'];
            $ret->base_url = $parameters['base_url'];
        } catch (JiraException $e) {
            $ret = "" . $e;
        }

        return $ret;
    }

    public function setStoryPoints()
    {
        $parameters = array_replace_recursive($this->jiraConfiguration, $_POST);
        $storypoints = $parameters['storypoints'];
        $issueKey = $parameters['issu_key'];

        try {
            $issueField = new IssueField(true);
            $issueField->addCustomField($parameters['story_point_field_name'], intval($storypoints));

            // optionally set some query params
            $editParams = [
                'notifyUsers' => false,
            ];


            $CurrentIssueService = new IssueService(new ArrayConfiguration(
                array(
                    'jiraHost' => $parameters['base_url'],
                    'jiraUser' => $parameters['username'],
                    'jiraPassword' => $parameters['password']
                )
            ));

            // You can set the $paramArray param to disable notifications in example
            $ret = $CurrentIssueService->update($issueKey, $issueField, $editParams);

        } catch (JiraRestApi\JiraException $e) {
            $ret = "" . $e;
        }

        return $ret;
    }
}

return new JiraController($entityManager);
