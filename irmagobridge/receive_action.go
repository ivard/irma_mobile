package irmagobridge

import (
	"encoding/base64"
	"encoding/json"

	"github.com/getsentry/raven-go"
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

	case "RecoveryReset":
		isConfigured := ""
		if client.RecoveryIsConfigured() {
			isConfigured = "backupConfigured"
		}
		sendAction(&OutgoingAction{
			"type":   "IrmaClient.RecoveryReset",
			"status": isConfigured,
		})

	case "RecoveryLoadBackup":
		log.Println("RecoveryLoadBackup")
		action := RecoveryLoadBackupAction{}
		log.Println(actionJSON)
		if err = json.Unmarshal(actionJSON, &action); err == nil {
			log.Println("No error")
			backupBytes, _ := base64.StdEncoding.DecodeString(action.BackupData)
			log.Println("backup decoded")
			recoveryHandler.backup = backupBytes
			recoveryHandler.Init()
			go client.StartRecovery(recoveryHandler)
		}

	case "RecoveryInit":
		log.Println("Initializing recovery")
		recoveryHandler.Init()
		go client.InitRecovery(recoveryHandler)

	case "RecoveryInitPin":
		action := RecoveryPinAction{}
		if err = json.Unmarshal(actionJSON, &action); err == nil {
			log.Println(action)
			log.Println(action.Proceed)
			if !action.Proceed {
				recoveryHandler.Close()
				return
			}
			recoveryHandler.pin <- &action.Pin
		}

	case "RecoveryLoadPhrase":
		action := RecoveryLoadPhraseAction{}
		log.Println(actionJSON)
		if err = json.Unmarshal(actionJSON, &action); err == nil {
			log.Println("Channel hit")
			if !action.Proceed {
				recoveryHandler.Close()
				return
			}
			recoveryHandler.recoveryPhrase <- action.RecoveryPhrase
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
