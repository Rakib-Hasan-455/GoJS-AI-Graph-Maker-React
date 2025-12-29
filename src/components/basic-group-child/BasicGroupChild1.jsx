import React, { useEffect, useRef } from "react";
import * as go from "gojs";

function BasicDiagram1({nodeDataArray, linkDataArray}) {
    const diagramRef = useRef(null);
    useEffect(() => {
        const $ = go.GraphObject.make;

        const diagram = $(go.Diagram, diagramRef.current, {
            "clickCreatingTool.archetypeNodeData": {
                text: "Node",
                color: "white",
            },
            "commandHandler.archetypeGroupData": {
                text: "Group",
                isGroup: true,
                color: "blue",
            },
            allowGroup: true,
            "undoManager.isEnabled": true,
        });

        function makeButton(text, action, visiblePredicate) {
            const button = $(
                "ContextMenuButton",
                $(go.TextBlock, text, { click: action })
            );
            if (visiblePredicate) {
                button.bindObject(
                    "visible",
                    "",
                    (o, e) => (o.diagram ? visiblePredicate(o, e) : false)
                );
            }
            return button;
        }

        function nodeInfo(d) {
            let str = `Node ${d.key}: ${d.text}\n`;
            str += d.group ? `member of ${d.group}` : "top-level node";
            return str;
        }

        function linkInfo(d) {
            return `Link:\nfrom ${d.from} to ${d.to}`;
        }

        function groupInfo(adornment) {
            const g = adornment.adornedPart;
            let links = 0;
            g.memberParts.each(p => {
                if (p instanceof go.Link) links++;
            });
            return `Group ${g.data.key}: ${g.data.text}\n${g.memberParts.count} members including ${links} links`;
        }

        const infoAdornment =
            $(go.Adornment, "Auto",
                {
                    layerName: "Tool",
                    selectable: false,
                    locationSpot: go.Spot.TopRight
                },
                $(go.Shape, "RoundedRectangle",
                    {
                        fill: "#ffffe0",
                        stroke: "#999"
                    }
                ),
                $(go.TextBlock,
                    {
                        margin: 8,
                        font: "12px sans-serif",
                        stroke: "#333",
                        wrap: go.Wrap.Fit,
                        width: 200
                    },
                    new go.Binding("text", "", d => {
                        return (
                            `Key: ${d.key}\n` +
                            `Text: ${d.text}\n` +
                            `Color: ${d.color || "n/a"}\n` +
                            `Location: ${d.loc || "n/a"}\n` +
                            `Group: ${d.group ?? "none"}`
                        );
                    })
                )
            );

        const editAdornment =
            $(go.Adornment, "Auto",
                {
                    layerName: "Tool",
                    selectable: false
                },
                $(go.Shape, "RoundedRectangle",
                    {
                        fill: "#ffffff",
                        stroke: "#999"
                    }
                ),
                $(go.Panel, "Table",
                    { padding: 8, defaultAlignment: go.Spot.Left },

                    // TEXT
                    $(go.TextBlock, "Text"),
                    $(go.TextBlock,
                        {
                            column: 1,
                            editable: true,
                            minSize: new go.Size(120, NaN)
                        },
                        new go.Binding("text", "text").makeTwoWay()
                    ),

                    // FILL COLOR
                    $(go.TextBlock, "Fill", { row: 1 }),
                    $("Button",
                        {
                            row: 1, column: 1,
                            click: (e, btn) => pickColor("color")
                        },
                        $(go.Shape, { width: 16, height: 16 },
                            new go.Binding("fill", "color"))
                    ),

                    // TEXT COLOR
                    $(go.TextBlock, "Text Color", { row: 2 }),
                    $("Button",
                        {
                            row: 2, column: 1,
                            click: (e, btn) => pickColor("textColor")
                        },
                        $(go.Shape, { width: 16, height: 16 },
                            new go.Binding("fill", "textColor"))
                    ),

                    // BORDER COLOR
                    $(go.TextBlock, "Border", { row: 3 }),
                    $("Button",
                        {
                            row: 3, column: 1,
                            click: (e, btn) => pickColor("stroke")
                        },
                        $(go.Shape, { width: 16, height: 16 },
                            new go.Binding("fill", "stroke"))
                    ),

                    // BORDER WIDTH
                    $(go.TextBlock, "Width", { row: 4 }),
                    $(go.TextBlock,
                        {
                            row: 4, column: 1,
                            editable: true
                        },
                        new go.Binding("text", "strokeWidth").makeTwoWay()
                    ),

                    // SHAPE
                    $(go.TextBlock, "Shape", { row: 5 }),
                    $("Button",
                        {
                            row: 5, column: 1,
                            click: (e, btn) => cycleFigure(btn)
                        },
                        $(go.TextBlock,
                            new go.Binding("text", "figure"))
                    )
                )
            );

        function cycleFigure(btn) {
            const figures = [
                "Rectangle",
                "RoundedRectangle",
                "Ellipse",
                "Diamond"
            ];

            const data = editAdornment.data;
            const current = data.figure || "RoundedRectangle";
            const next =
                figures[(figures.indexOf(current) + 1) % figures.length];

            btn.diagram.startTransaction("figure change");
            btn.diagram.model.setDataProperty(data, "figure", next);
            btn.diagram.commitTransaction("figure change");
        }

        function pickColor(prop) {
            const input = document.createElement("input");
            input.type = "color";

            input.oninput = () => {
                diagram.startTransaction("color change");
                diagram.model.setDataProperty(
                    editAdornment.data,
                    prop,
                    input.value
                );
                diagram.commitTransaction("color change");
            };

            input.onblur = () => {
                document.body.removeChild(input);
            };

            document.body.appendChild(input);
            input.click();
        }



        const partContextMenu = $(
            "ContextMenu",
            // makeButton("View", (e, obj) => {
            //     const part = obj.part.adornedPart;
            //     if (!(part instanceof go.Node)) return;
            //
            //     // Remove any existing info panel
            //     diagram.remove(infoAdornment);
            //
            //     // Attach info panel to this node
            //     infoAdornment.adornedObject = part;
            //     infoAdornment.data = part.data;
            //
            //     // Position it beside the node
            //     infoAdornment.location =
            //         part.getDocumentPoint(go.Spot.TopRight).offset(10, 0);
            //
            //     diagram.add(infoAdornment);
            // }),
            makeButton("Edit node", (e, obj) => {
                const part = obj.part.adornedPart;
                if (!(part instanceof go.Node)) return;

                diagram.remove(editAdornment);

                editAdornment.adornedObject = part;
                editAdornment.data = part.data;

                editAdornment.location =
                    part.getDocumentPoint(go.Spot.TopRight).offset(10, 0);

                diagram.add(editAdornment);
            }),
            makeButton("Cut", e => e.diagram.commandHandler.cutSelection(),
                o => o.diagram.commandHandler.canCutSelection()),
            makeButton("Copy", e => e.diagram.commandHandler.copySelection(),
                o => o.diagram.commandHandler.canCopySelection()),
            makeButton("Paste", e =>
                    e.diagram.commandHandler.pasteSelection(
                        e.diagram.toolManager.contextMenuTool.mouseDownPoint
                    ),
                o =>
                    o.diagram.commandHandler.canPasteSelection(
                        o.diagram.toolManager.contextMenuTool.mouseDownPoint
                    )),
            makeButton("Delete", e => e.diagram.commandHandler.deleteSelection(),
                o => o.diagram.commandHandler.canDeleteSelection()),
        makeButton(
            "Group",
            (e) => e.diagram.commandHandler.groupSelection(),
            (o) => o.diagram.commandHandler.canGroupSelection()
        ),
            makeButton(
                "Ungroup",
                (e) => e.diagram.commandHandler.ungroupSelection(),
                (o) => o.diagram.commandHandler.canUngroupSelection()
            ),

    );
        diagram.addDiagramListener("BackgroundSingleClicked", () => {
            // diagram.remove(infoAdornment);
            diagram.remove(editAdornment);
        });

        diagram.addDiagramListener("ObjectSingleClicked", e => {
            if (!(e.subject instanceof go.Node)) {
                // diagram.remove(infoAdornment);
                diagram.remove(editAdornment);
            }
        });

        diagram.nodeTemplate = $(
            go.Node,
            "Auto",
            {
                locationSpot: go.Spot.Center,
                toolTip: $(
                    "ToolTip",
                    $(go.TextBlock, { margin: 4 }).bind("text", "", nodeInfo)
                ),
                contextMenu: partContextMenu,
            },
            new go.Binding("location", "loc", go.Point.parse)
                .makeTwoWay(go.Point.stringify),

            $(
                go.Shape,
                "RoundedRectangle",
                {
                    fill: "white",
                    portId: "",
                    cursor: "pointer",
                    fromLinkable: true,
                    toLinkable: true,
                },
                new go.Binding("fill", "color"),
                new go.Binding("stroke", "stroke"),
                new go.Binding("strokeWidth", "strokeWidth"),
                new go.Binding("figure", "figure")
            ),
            $(
                go.TextBlock,
                {
                    font: "bold 14px sans-serif",
                    stroke: "#333",
                    margin: 6,
                    editable: true,
                },
                new go.Binding("text", "text").makeTwoWay(),
                new go.Binding("stroke", "textColor")
            )
        );

        diagram.linkTemplate = $(
            go.Link,
            {
                relinkableFrom: true,
                relinkableTo: true,
                toolTip: $(
                    "ToolTip",
                    $(go.TextBlock, { margin: 4 }).bind("text", "", linkInfo)
                ),
                contextMenu: partContextMenu,
            },
            $(go.Shape, { strokeWidth: 2 }, new go.Binding("stroke", "color")),
            $(go.Shape, { toArrow: "Standard", stroke: null },
                new go.Binding("fill", "color"))
        );

        diagram.groupTemplate = $(
            go.Group,
            "Vertical",
            {
                ungroupable: true,
                toolTip: $(
                    "ToolTip",
                    $(go.TextBlock, { margin: 4 }).bindObject("text", "", groupInfo)
                ),
                contextMenu: partContextMenu,
            },
            $(
                go.TextBlock,
                {
                    font: "bold 19px sans-serif",
                    editable: true,
                },
                new go.Binding("text", "text").makeTwoWay(),
                new go.Binding("stroke", "color")
            ),
            $(
                go.Panel,
                "Auto",
                $(go.Shape, "Rectangle", {
                    fill: "rgba(128,128,128,0.2)",
                    stroke: "gray",
                    strokeWidth: 3,


                    // 🔥 IMPORTANT PART
                    portId: "",                 // makes group a port
                    cursor: "pointer",
                    fromLinkable: true,
                    toLinkable: true,
                    fromLinkableSelfNode: true,
                    toLinkableSelfNode: true,
                    fromLinkableDuplicates: true,
                    toLinkableDuplicates: true,
                }),
                $(go.Placeholder, { margin: 10 })
            )
        );

        console.log('----------------');
        console.log(nodeDataArray);
        console.log(linkDataArray);
        console.log('----------------');
        diagram.model = new go.GraphLinksModel(
            nodeDataArray,linkDataArray
        );

        return () => {
            diagram.div = null;
        };

    }, [nodeDataArray, linkDataArray]);

    return (
        <div>
            <div
                ref={diagramRef}
                style={{
                    width: "100%",
                    height: "60vh",
                    border: "1px solid #ccc",
                }}
            />
            <p>
                This sample demonstrates tooltips, context menus, grouping, linking,
                undo/redo, and editing using GoJS in React.
            </p>
        </div>
    );
};

export default BasicDiagram1;
