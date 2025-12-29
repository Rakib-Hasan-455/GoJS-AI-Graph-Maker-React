import React, {useEffect, useRef} from "react";
import * as go from "gojs";
import type {ObjectData} from "gojs";

interface MindMapProps {
    nodes?: ObjectData[],
    onAddNode?: (parent: any) => void,
}

const MindMap: React.FC<MindMapProps> = ({nodes, onAddNode}) => {
    const diagramRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!diagramRef.current) return;

        const $ = go.GraphObject.make;

        const myDiagram = $(go.Diagram, diagramRef.current, {
            padding: 14,
            "commandHandler.copiesTree": true,
            "commandHandler.copiesParentKey": true,
            "commandHandler.deletesTree": true,
            "draggingTool.dragsTree": true,
            "undoManager.isEnabled": true,
        });

        /* ---------- Model ---------- */

        myDiagram.model = new go.TreeModel({
            nodeDataArray: nodes,
        });

        /* ---------- Helpers ---------- */

        const spotConverter = (dir: string, from: boolean) => {
            if (dir === "left") {
                return from ? go.Spot.Left : go.Spot.Right;
            }
            return from ? go.Spot.Right : go.Spot.Left;
        };

        const layoutAngle = (parts: go.Set<go.Part>, angle: number) => {
            const layout = new go.TreeLayout({
                angle,
                arrangement: go.TreeArrangement.FixedRoots,
                nodeSpacing: 5,
                layerSpacing: 20,
                setsPortSpot: false,
                setsChildPortSpot: false,
            });
            layout.doLayout(parts);
        };

        const layoutAll = () => {
            const root = myDiagram.findTreeRoots().first();
            if (!root) return;

            myDiagram.startTransaction("Layout");

            const rightward = new go.Set<go.Part>();
            const leftward = new go.Set<go.Part>();

            root.findLinksConnected().each((link) => {
                const child = link.toNode;
                if (!child) return;

                if (child.data.dir === "left") {
                    leftward.add(root);
                    leftward.add(link);
                    leftward.addAll(child.findTreeParts());
                } else {
                    rightward.add(root);
                    rightward.add(link);
                    rightward.addAll(child.findTreeParts());
                }
            });

            layoutAngle(rightward, 0);
            layoutAngle(leftward, 180);

            myDiagram.commitTransaction("Layout");
        };

        const addNodeAndLink = (_e: go.InputEvent, obj: go.GraphObject) => {
            const adornment = obj.part as go.Adornment;
            const parentNode = adornment.adornedPart as go.Node;
            if (onAddNode && parentNode && parentNode.data) {
                myDiagram.startTransaction("Add Node");
                console.log(parentNode.data.key);
                onAddNode(parentNode.data);
                myDiagram.commitTransaction("Add Node");
            }
            console.log(nodes)
            //
            // const totalNodes = myDiagram.nodes.count;
            // console.log(totalNodes);
            // const parentData = parentNode.data;
            // const direction = totalNodes == 1 ? "left" : parentData.dir;
            // const newNode = {
            //     text: "idea",
            //     brush: parentData.brush,
            //     dir: direction,
            //     parent: parentData.key,
            // };
            //
            // (myDiagram.model as go.TreeModel).addNodeData(newNode);
            // layoutAll();
            //
        };

        /* ---------- Node Template ---------- */

        myDiagram.nodeTemplate = $(
            go.Node,
            "Vertical",
            {selectionObjectName: "TEXT"},
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            new go.Binding("locationSpot", "dir", (d) => spotConverter(d, false)),
            $(
                go.TextBlock,
                {
                    name: "TEXT",
                    minSize: new go.Size(30, 15),
                    editable: true,
                },
                new go.Binding("text").makeTwoWay(),
                new go.Binding("scale").makeTwoWay(),
                new go.Binding("font").makeTwoWay()
            ),
            $(
                go.Shape,
                "LineH",
                {
                    stretch: go.Stretch.Horizontal,
                    strokeWidth: 3,
                    height: 3,
                    portId: "",
                    fromSpot: go.Spot.LeftRightSides,
                    toSpot: go.Spot.LeftRightSides,
                },
                new go.Binding("stroke", "brush"),
                new go.Binding("fromSpot", "dir", (d) => spotConverter(d, true)),
                new go.Binding("toSpot", "dir", (d) => spotConverter(d, false))
            )
        );

        /* ---------- Selection Adornment (+ button) ---------- */

        myDiagram.nodeTemplate.selectionAdornmentTemplate = $(
            go.Adornment,
            "Spot",
            $(
                go.Panel,
                "Auto",
                $(go.Shape, {stroke: "dodgerblue", strokeWidth: 1, fill: null}),
                $(go.Placeholder, {margin: new go.Margin(4, 2, 0, 4)})
            ),
            $(
                "Button",
                {
                    alignment: go.Spot.Right,
                    alignmentFocus: go.Spot.Left,
                    click: addNodeAndLink,
                },
                $(go.TextBlock, "+", {font: "bold 8pt sans-serif"})
            )
        );

        /* ---------- Link Template ---------- */

        myDiagram.linkTemplate = new go.Link({
            curve: go.Curve.Bezier,
            fromShortLength: -2,
            toShortLength: -2,
            selectable: false
        }).add(
            new go.Shape({
                strokeWidth: 3,
            }).bindObject(
                "stroke",
                "toNode",
                (n: go.Node | null) => {
                    return n?.data?.brush ?? "black";
                }
            )
        );


        layoutAll();

        return () => {
            myDiagram.div = null;
        };
    }, [nodes]);

    return (
        <div
            ref={diagramRef}
            style={{
                width: "100%",
                height: "60vh",
                border: "1px solid #ccc",
            }}
        />
    );
};

export default MindMap;