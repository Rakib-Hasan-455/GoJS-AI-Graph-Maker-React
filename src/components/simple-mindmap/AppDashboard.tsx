import {LeftNavBar} from "./LeftNavBar.tsx";
import {useEffect, useState} from "react";
import {TopNavBar} from "./TopNavBar.tsx";
import type {MindMapNode} from "./MindMapNode.type.ts";
import {type NodeData, NodeFormDialog} from "./NodeFormDialog.tsx";
import MindMap from "./MindMap.tsx";
import type {ObjectData} from "gojs";
import {Save} from "lucide-react";
import {toast} from "react-toastify";
import go from "gojs";

function AppDashboard() {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [parentNodeKey, setParentNodeKey] = useState<number | null>(null);
    const [parentNode, setParentNode] = useState<any | null>(null);
    const [nodes, setNodes] = useState<ObjectData[]>([]);
    const [nextKey, setNextKey] = useState(2);

    const handleAddNode = (parent: any) => {
        console.log(nodes)
        setParentNode(parent);
        setParentNodeKey(parent["key"] as number);
        setIsDialogOpen(true);
    };

    useEffect(() => {
        fetch("http://localhost:8081/mindgraph/getSimpleGraph")
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch data");
                }
                return res.json();
            })
            .then((result) => {
                console.log(result);
                setNodes(result.content.content);
             })
            .catch(() => {

            });
    }, []);

    const handleSaveNode = (data: NodeData) => {

        const direction = parentNode.key !== 1 ? parentNode.dir : data.dir;
        console.log(parentNode)
        const parentLoc = go.Point.parse(parentNode.loc);
        // offset for new node
        const offsetX = 120;
        const offsetY = 0;

        const newLoc = new go.Point(
            parentLoc.x + offsetX,
            parentLoc.y + offsetY
        );

        const newNode: MindMapNode = {
            key: nextKey,
            parent: parentNodeKey || undefined,
            reference: data.reference || "",
            name: data.title,
            text: data.reference + " " + data.title,
            description: data.description,
            brush: data.brush || "skyblue",
            dir: direction || "right",
            loc: go.Point.stringify(newLoc),
        };
        setNodes([...nodes, newNode]);
        setNextKey(nextKey + 1);
        setParentNodeKey(null);
    };

    const handleSaveGraph = () => {
        fetch("http://localhost:8081/mindgraph/saveSimpleGraph", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({content: nodes}),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to save data");
                }
                return res.json();
            })
            .then((result) => {
                toast("Successfully saved graph!", {type: "success"});
                setNodes(result.content.content);
                console.log("Graph saved successfully:", result);
            })
            .catch((error) => {
                console.error("Error saving graph:", error);
            });
    }

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
                            <div className="h-[calc(100%-80px)]">
                                {/*<MindMapDiagram nodes={nodes} onAddNode={handleAddNode} />*/}
                                <div className="flex justify-end p-4 border-b border-gray-200">
                                    <button onClick={handleSaveGraph}
                                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-bold p-1 rounded">
                                        <Save size={15}/>
                                    </button>

                                </div>
                                <MindMap nodes={nodes} onAddNode={handleAddNode}/>
                            </div>
                        </div>
                    </div>
                </main>
            </div>


            <NodeFormDialog
                parentNode={parentNode}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={handleSaveNode}
            />
        </div>
    );
}

export default AppDashboard;