# Release Notes

## Version 2.3.1
- better vote history design and added timestamps
- adjusted player menu styling on smaller screens
- improved CONTRIBUTING.md description of hosting your own copy

---

## Version 2.3.0
- added spoiler role (Lycanthrope!)
- fixed copy to clipboard in Firefox
- fixed non-countdown votes still playing countdown sound for a split second

---

## Version 2.2.1
- clearing players / roles now also clears Fabled
- fix list of locked votes showing unlocked votes sometimes

---

## Version 2.2.0
- added [V] hotkey to open nomination history (thanks @lilserf)
- updated roles according to official Wiki changes
- adjusted roles night order

---

## Version 2.1.1
- show vote results at the end of a vote
- fixed global reminders not showing up anymore when the associated role is assigned to a player
- adjusted backend metrics


---

## Version 2.1.0
- reduced countdown volume by 10db
- added a mute toggle to the Grimoire menu (currently only silences the countdown)
- pressing [J] while in a session will now leave the session
- always show reminder add button when on a mobile device that doesn't support hovering
- removed screenshot feature as it is no longer useful

---

## Version 2.0.4
- fix bug with live sessions that contain travelers from a different set
- fix server channel cleanup

---

## Version 2.0.3
- load roles that belong to different editions (like travelers) from gamestate
- close session when missing custom roles and open edition modal
- added a few more metrics

---

## Version 2.0.2
- fix nomination history type not detecting travelers
- fix live session domain whitelist
- fix build path
- fix changelog version numbering

---

## Version 2.0.1
- clearing the nomination history as the Storyteller clears it for the players too
- vote buttons should work in all situations correctly now
- fixed some minor styling and live session issues

---

## Version 2.0.0
- The project is now available under its own domain: [clocktower.online](https://clocktower.online)
- Added a feature that allows a live session Storyteller to automatically (and safely) distribute assigned
  characters to all players that have claimed a seat, eliminating the need to manually tell every player their role
- Visible "night phase" that can be toggled by the Storyteller
- Voting history added with nomination and vote results
- Optional, audible voting countdown added (featuring an actual clock tower bell!)
- Fabled show up on the Night Order sheet and affect Grimoire night order counters
- Current game state can now be easily exported and imported in the form of a JSON text code
- Voting can be paused and sped up / slowed down in 0.5 second increments by the Storyteller
- Voting terminology changed to "Hand UP" / "Hand DOWN" and iconography updated
- Added meta-data support for custom scripts, that currently supports `name`, `author` and a custom `logo` through a
  `_meta` role (note that a customized logo will not be synced to players in a live session)
- Players can no longer claim seats that are already occupied and only the Storyteller can vacate seats of other players
  (players can still vacate their own seat)
- Characters selected in the bluff window now also show up in the list of reminder tokens
- Homebrew scripts / custom characters no longer automatically load in live sessions, for 2 reasons:
  - the players in a live session have no control over the script that the storyteller loads,
    so a malicious storyteller could load a custom script that contains harmful / inappropriate images
  - some homebrew scripts are quite big JSON files and synching these through the live session
    server can cause traffic / performance issue easily
  - this change may be reverted in the future when I figure out a way to sync custom characters safely and without
    such a big impact on performance constraints
- Buggy (spamming) live session connections will now be terminated on the server side and display an error message
- Balloonist reminder tokens adjusted
- Live session URLs shortened
- Deus Ex Fiasco and Stormcatcher Fabled added / updated
- Custom Reminder text looks better when there is a lot of text
- added a README for the backend server
