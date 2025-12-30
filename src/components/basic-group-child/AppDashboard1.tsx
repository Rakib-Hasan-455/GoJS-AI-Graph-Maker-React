import {useEffect, useState} from "react";
import {LeftNavBar} from "../simple-mindmap/LeftNavBar.tsx";
import {TopNavBar} from "../simple-mindmap/TopNavBar.tsx";
import BasicDiagram1 from "./BasicGroupChild1";
import {toast} from "react-toastify";
import {Save} from "lucide-react";
import {envUrl} from "../../main.tsx";


function AppDashboard1() {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [nodeDataArray, setNodeDataArray] = useState([]);
    const [linkDataArray, setLinkDataArray] = useState([]);

    useEffect(() => {
        fetch(envUrl + "mindgraph/getLinkDataGraph")
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch data");
                }
                return res.json();
            })
            .then((result) => {
                console.log(result);
                if(result.content.content.nodeDataArray && result.content.content.linkDataArray) {
                    setNodeDataArray(result.content.content.nodeDataArray);
                    setLinkDataArray(result.content.content.linkDataArray);
                }
                console.log(result.content.content)
            })
            .catch(() => {

            });
    }, []);


    const handleSaveGraph = () => {
        fetch(envUrl +  "mindgraph/saveLinkDataGraph", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({content: {"nodeDataArray": nodeDataArray, "linkDataArray": linkDataArray}}),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to save data");
                }
                return res.json();
            })
            .then((result) => {
                toast("Successfully saved graph!", {type: "success"});
                setLinkDataArray(result.content.content.linkDataArray);
                setNodeDataArray(result.content.content.nodeDataArray);
                console.log("Graph saved successfully:", result);
            })
            .catch((error) => {
                console.error("Error saving graph:", error);
            });
    }
    const [description, setDescription] = useState("");
    const handleSendPrompt = () => {
        if (description.trim().length < 4) {
            toast("Text must be at least 4 characters", { type: "error" });
            return;
        }

        fetch(envUrl + "api/diagram", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                description: description.trim(),
            }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to send prompt");
                }
                return res.json();
            })
            .then((result) => {
                toast("Request sent successfully!", { type: "success" });
                console.log("Diagram response:", result);

                // optional: update state here if API returns graph data
                setNodeDataArray(result.nodeDataArray);
                setLinkDataArray(result.linkDataArray);
            })
            .catch((error) => {
                console.error("Error sending prompt:", error);
                toast("Something went wrong!", { type: "error" });
            });
    };


    return (
        <div className="flex h-screen bg-gray-100">
            <LeftNavBar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBar onMenuClick={() => setIsNavOpen(true)} />

                <main className="flex-1 overflow-hidden">
                    <div className="h-full p-6">
                        <div className="bg-white rounded-lg shadow-lg h-full overflow-hidden">
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Interactive Mind Map
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Click the + button on any node to add a child node
                                </p>
                            </div>
                            <div className="h-[calc(100%-80px) ]">

                                <div className="flex items-center p-4 border-b border-gray-200">
                                    {/* Message box on the left */}
                                    <textarea className="w-full max-w-3/5 p-2 border border-gray-300 rounded "
                                              placeholder="What you want to do..."
                                              value={description}
                                              onChange={(e) => setDescription(e.target.value)}/>
                                    <button
                                        className="ml-4 flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 rounded"
                                        onClick={handleSendPrompt}> Do it!
                                    </button>

                                    {/* Save button on the right */}
                                    <button
                                        onClick={handleSaveGraph}
                                        className="ml-4 flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 rounded ml-auto"
                                    >
                                        <Save size={15}/>
                                    </button>
                                </div>

                                <BasicDiagram1 linkDataArray={linkDataArray} nodeDataArray={nodeDataArray}/>

                            </div>
                        </div>
                    </div>
                </main>
            </div>


        </div>
    );
}

export default AppDashboard1;