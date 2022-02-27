import * as vscode from 'vscode'; 
import { Memento } from "vscode";

class LocalStorage { 
    constructor(private storage: Memento) { }   
    
    public getValue<T>(key : string, def : T) : T{
        return this.storage.get<T>(key, def);
    }

    public setValue<T>(key : string, value : T){
        this.storage.update(key, value );
    }
}



export function activate(context: vscode.ExtensionContext) {

	const storage : LocalStorage = new LocalStorage(context.globalState);

	const label = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left); 
	label.show(); 
	context.subscriptions.push(label);
	
	let total_keypress_count : number = storage.getValue<number>("total_keypress_count", 0);
	let consecutive_count : number = 0; 
	let timeout_handle : NodeJS.Timeout;

	const updateLabel = () => {
		// format total_keypress_count as  1,234,567
		let formatted_count = total_keypress_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); 
        label.text = "$(flame)" + formatted_count + (consecutive_count > 0 ? ` | ${consecutive_count} combo` : '');
	}
	updateLabel()

	const onKeyPressed = () => {
		consecutive_count++; 
		updateLabel();
		if(timeout_handle){
			clearTimeout(timeout_handle);
		}
		timeout_handle = setTimeout(() => {
			onConsecutiveEnded()
		},3000)
	}
	
	const onConsecutiveEnded = () => {
		total_keypress_count = storage.getValue<number>("total_keypress_count", 0);
		total_keypress_count += consecutive_count;
		storage.setValue("total_keypress_count", total_keypress_count);
		consecutive_count = 0;
		updateLabel();
	}

	vscode.workspace.onDidChangeTextDocument(event => {   
		onKeyPressed(); 
	})
}

export function deactivate() {}
