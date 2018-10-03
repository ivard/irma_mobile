package irmagobridge

import (
	"encoding/hex"
	"encoding/json"

	raven "github.com/getsentry/raven-go"
	"github.com/go-errors/errors"
	"log"
)

func ReceiveAction(actionJSONString string) {
	raven.CapturePanic(func() {
		recoveredReceiveAction(actionJSONString)
	}, nil)
}

func recoveredReceiveAction(actionJSONString string) {
	actionJSON := []byte(actionJSONString)

	actionType, err := getActionType(actionJSON)
	if err != nil {
		logError(err)
		log.Println(err)
		return
	}

	logDebug("Received action with type " + actionType)
	log.Println("Received action with type " + actionType)

	switch actionType {
	case "Enroll":
		action := &EnrollAction{}
		if err = json.Unmarshal(actionJSON, action); err == nil {
			err = actionHandler.Enroll(action)
		}

	case "ChangePin":
		action := &ChangePinAction{}
		if err = json.Unmarshal(actionJSON, action); err == nil {
			err = actionHandler.ChangePin(action)
		}

	case "NewSession":
		action := &NewSessionAction{}
		if err = json.Unmarshal(actionJSON, action); err == nil {
			err = actionHandler.NewSession(action)
		}

	case "NewManualSession":
		action := &NewManualSessionAction{}
		if err = json.Unmarshal(actionJSON, action); err == nil {
			err = actionHandler.NewManualSession(action)
		}

	case "RespondPermission":
		action := &RespondPermissionAction{}
		if err = json.Unmarshal(actionJSON, action); err == nil {
			err = actionHandler.RespondPermission(action)
		}

	case "RespondPin":
		action := &RespondPinAction{}
		if err = json.Unmarshal(actionJSON, action); err == nil {
			err = actionHandler.RespondPin(action)
		}

	case "RemoveAllAttributes":
		err = actionHandler.RemoveAll()

	case "DeleteCredential":
		action := &DeleteCredentialAction{}
		if err = json.Unmarshal(actionJSON, action); err == nil {
			err = actionHandler.DeleteCredential(action)
		}

	case "DismissSession":
		action := &DismissSessionAction{}
		if err = json.Unmarshal(actionJSON, action); err == nil {
			err = actionHandler.DismissSession(action)
		}

	case "SetCrashReportingPreference":
		action := &SetCrashReportingPreferenceAction{}
		if err = json.Unmarshal(actionJSON, &action); err == nil {
			err = actionHandler.SetCrashReportingPreference(action)
		}

	case "RecoveryStart":
		log.Println("Recovery")
		action := RecoveryAction{}
		if err = json.Unmarshal(actionJSON, &action); err == nil {
			backupBytes, _ := hex.DecodeString(action.BackupData)
			recoveryHandler.backup = backupBytes
			log.Println(action.RecoveryPhrase)
			recoveryHandler.recoveryPhrase = action.RecoveryPhrase
			go client.StartRecovery(recoveryHandler)
			newClient := <-recoveryHandler.newClient
			if newClient != nil {
				client = newClient
				sendCredentials()
				sendEnrollmentStatus()
				sendPreferences()
				sendRecoveryDone()
			}
		}

	case "RecoveryInit":
		log.Println("Initializing recovery")
		go client.InitRecovery(recoveryHandler)

	case "RecoveryInitPin":
		action := RecoveryPinAction{}
		log.Println(actionJSON)
		if err = json.Unmarshal(actionJSON, &action); err == nil {
			log.Println(action)
			log.Println(action.Proceed)
			if !action.Proceed {
				recoveryHandler.pin <- nil
				return
			}
			recoveryHandler.pin <- &action.Pin
		}

	case "RecoveryMakeBackup":
		log.Println("Making backup")
		go client.MakeBackup(recoveryHandler)

	default:
		err = errors.Errorf("Unrecognized action type %s", actionType)
	}

	if err != nil {
		logError(errors.New(err))
	}
}

func getActionType(actionJSON []byte) (actionType string, err error) {
	action := new(struct{ Type string })
	err = json.Unmarshal(actionJSON, action)
	if err != nil {
		return "", errors.Errorf("Could not parse action type: %s", err)
	}

	return action.Type, nil
}
