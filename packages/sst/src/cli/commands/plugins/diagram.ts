import { useBus } from "../../../bus.js";
import { Metadata } from "../../../constructs/Metadata.js";
import { Logger } from "../../../logger.js";
// import { Context } from "../../../context/context.js";
// import { useAWSClient } from "../../../credentials.js";
import { lazy } from "../../../util/lazy.js";
import * as fs from "fs/promises";
import d2 from "d2lang-js";

export const useDiagramGenerator = lazy(async () => {
  const bus = useBus();
  const logger = Logger.debug.bind(null, "[diagram]");

  async function generate(resources: Metadata[]) {
      logger("Generating diagram...");
      logger('resources', resources);

      // nodes
      const resource = new d2.D2Shape( "resource", resources[0].id, d2.Shape.rectangle);
      const company = new d2.D2Shape( "google", 'Google', d2.Shape.rectangle);

      // edges
      const connection = new d2.D2Connection(company.name, resource.name, "uses", d2.Direction.TO);

      // diagram
      const diagram = new d2.D2Diagram([resource], [connection]);

      logger('diagram:', diagram.toString());

      await fs.writeFile("diagram.d2", diagram.toString());
  }

  bus.subscribe("stacks.metadata", (evt) => {
      const resources = Object.values(evt.properties).flat();

      generate(resources).catch((err) => {
          logger("failed to generate diagram", err);
      });
  });

  logger('Loaded diagram generator');
});
