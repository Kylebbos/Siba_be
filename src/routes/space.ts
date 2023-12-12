import express, { Request, Response } from 'express';
import { admin } from '../authorization/admin.js';
import { planner } from '../authorization/planner.js';
import { roleChecker } from '../authorization/roleChecker.js';
import { statist } from '../authorization/statist.js';
import { authenticator } from '../authorization/userValidation.js';
import db from '../db/index.js';
import db_knex from '../db/index_knex.js';
import {
  dbErrorHandler,
  requestErrorHandler,
  successHandler,
} from '../responseHandler/index.js';
import { Space } from '../types/custom.js';
import logger from '../utils/logger.js';
import { validate, validateIdObl } from '../validationHandler/index.js';
import {
  validateMultiSpacePost,
  validateSpacePut,
} from '../validationHandler/space.js';

const space = express.Router();

// Get all spaces
space.get(
  '/',
  [authenticator, admin, planner, statist, roleChecker, validate],
  (req: Request, res: Response) => {
    db_knex
      .select(
        's.id',
        's.name',
        's.area',
        's.info',
        's.personLimit',
        's.buildingId',
        db_knex.raw('TIME_FORMAT(s.availableFrom,"%H:%i") as "availableFrom"'),
        db_knex.raw('TIME_FORMAT(s.availableTo,"%H:%i") as "availableTo"'),
        db_knex.raw('TIME_FORMAT(s.classesFrom,"%H:%i") as "classesFrom"'),
        db_knex.raw('TIME_FORMAT(s.classesTo,"%H:%i") as "classesTo"'),
        's.inUse',
        's.spaceTypeId',
        'b.name AS buildingName',
        'st.name AS spaceTypeName',
      )
      .from('Space as s')
      .innerJoin('Building as b', 's.buildingId', 'b.id')
      .leftJoin('SpaceType as st', 's.spaceTypeId', 'st.id')
      .then((spaces) => {
        successHandler(req, res, spaces, 'getAll successful - Space');
      })
      .catch((err) => {
        requestErrorHandler(
          req,
          res,
          `Oops! Nothing came through - Space: ${err.message}`,
        );
      });
  },
);

// SPECIAL Listing all the spaces for selection dropdown etc.
// (Just name and id) using knex
space.get(
  '/getNames',
  [authenticator, admin, roleChecker],
  (req: Request, res: Response) => {
    db_knex
      .select('id', 'name')
      .from('Space')
      .then((spaceNames) => {
        successHandler(req, res, spaceNames, 'getNames successful - Space');
      })
      .catch((error) => {
        dbErrorHandler(req, res, error, 'Oops! Nothing came through - Space');
      });
  },
);

// SPECIAL list all space name with building name
space.get(
  '/NameInBuilding',
  [authenticator, admin, roleChecker],
  (req: Request, res: Response) => {
    db_knex('Space')
      .select(db_knex.raw('CONCAT(Space.name, "-", Building.name) as name'))
      .join('Building', 'Space.buildingId', '=', 'Building.id')
      .then((spaceNames) => {
        successHandler(req, res, spaceNames, 'getNames successful - Space');
      })
      .catch((error) => {
        dbErrorHandler(req, res, error, 'Oops! Nothing came through - Space');
      });
  },
);

space.get(
  '/:id',
  validateIdObl,
  [authenticator, admin, planner, roleChecker, validate],
  (req: Request, res: Response) => {
    const id = req.params.id;
    db_knex('Space')
      .select(
        's.id',
        's.name',
        's.area',
        's.info',
        's.personLimit',
        's.buildingId',
        db_knex.raw('TIME_FORMAT(s.availableFrom,"%H:%i") as "availableFrom"'),
        db_knex.raw('TIME_FORMAT(s.availableTo,"%H:%i") as "availableTo"'),
        db_knex.raw('TIME_FORMAT(s.classesFrom,"%H:%i") as "classesFrom"'),
        db_knex.raw('TIME_FORMAT(s.classesTo,"%H:%i") as "classesTo"'),
        's.inUse',
        's.spaceTypeId',
        'b.name AS buildingName',
        'st.name AS spaceTypeName',
      )
      .from('Space as s')
      .innerJoin('Building as b', 's.buildingId', 'b.id')
      .leftJoin('SpaceType as st', 's.spaceTypeId', 'st.id')
      .where('s.id', id)
      .then((spaces) => {
        if (spaces.length === 1) {
          successHandler(
            req,
            res,
            spaces,
            'get space by id successful - Space',
          );
        } else {
          requestErrorHandler(req, res, `No space found with id ${id}`);
        }
      })
      .catch((error) => {
        dbErrorHandler(req, res, error, 'DB prob while trying get space by id');
      });
  },
);

// Adding a space
space.post(
  '/',
  [authenticator, admin, planner, roleChecker, validate],
  (req: Request, res: Response) => {
    const spaceData = {
      name: req.body.name,
      area: req.body.area,
      info: req.body.info,
      personLimit: req.body.personLimit,
      buildingId: req.body.buildingId,
      availableFrom: req.body.availableFrom,
      availableTo: req.body.availableTo,
      classesFrom: req.body.classesFrom,
      classesTo: req.body.classesTo,
      inUse: req.body.inUse || true, // Default to true if not provided
      spaceTypeId: req.body.spaceTypeId,
    };

    db_knex('Space')
      .insert(spaceData)
      .then((result) => {
        if (result.length === 0) {
          requestErrorHandler(req, res, 'Nothing to insert');
        } else {
          successHandler(
            req,
            res,
            { insertId: result[0] }, // Assuming auto-incremented ID
            'Space created successfully.',
          );
        }
      })
      .catch((error) => {
        requestErrorHandler(
          req,
          res,
          `Oops! Create failed - Space: ${error.message}`,
        );
      });
  },
);

// Adding multiple subjects/teachings using knex
space.post(
  '/multi',
  validateMultiSpacePost,
  [authenticator, admin, planner, roleChecker, validate],
  async (req: Request, res: Response) => {
    console.log(req.body);
    const spaceData: Space[] = [];

    for (const space of req.body) {
      const [building] = await db_knex('Building')
        .select('id')
        .where('name', space.buildingName);
      const [spaceType] = await db_knex('SpaceType')
        .select('id')
        .where('name', space.spaceType);

      if (!building || !space) {
        return !building
          ? requestErrorHandler(
              req,
              res,
              `'Program ${building.buildingName} not found`,
            )
          : requestErrorHandler(
              req,
              res,
              `Space ${building.spaceType} not found`,
            );
      }

      spaceData.push({
        name: space.name,
        area: space.area,
        info: space.info,
        personLimit: space.personLimit,
        buildingId: building.id,
        availableFrom: space.availableFrom,
        availableTo: space.availableTo,
        classesFrom: space.classesFrom,
        classesTo: space.classesTo,
        inUse: space.inUse,
        spaceTypeId: spaceType.id,
      });
    }

    console.log(spaceData);

    db_knex('Space')
      .insert(spaceData)
      .then((result) => {
        if (result.length === 0) {
          requestErrorHandler(req, res, 'Nothing to insert');
        } else {
          successHandler(
            req,
            res,
            { insertId: result }, // Assuming auto-incremented ID
            'Create successful - Spaces',
          );
          logger.info('Spaces created');
        }
      })
      .catch((error) => {
        dbErrorHandler(req, res, error, 'Oops! Create failed - Spaces');
      });
  },
);

// Delete space by id
/*
space.delete(
  '/:id',
  [authenticator, admin, roleChecker, validate],
  (req: Request, res: Response) => {
    db_knex('Space')
      .where('id', req.params.id)
      .del()
      .then((rowsAffected) => {
        if (rowsAffected === 1) {
          successHandler(
            req,
            res,
            rowsAffected,
            `Delete successful! Count of deleted rows: ${rowsAffected}`,
          );
        } else {
          requestErrorHandler(req, res, `Invalid space ID: ${req.params.id}`);
        }
      })
      .catch((error) => {
        requestErrorHandler(req, res, `Error deleting space: ${error.message}`);
      });
  },
);*/

space.delete(
  '/:id',
  validateIdObl,
  [authenticator, admin, planner, roleChecker, validate],
  (req: Request, res: Response) => {
    const id = req.params.id;
    const sqlDelete = 'DELETE FROM Space WHERE id = ?;';
    db.query(sqlDelete, id, (err, result) => {
      if (err) {
        dbErrorHandler(req, res, err, 'Oops! Delete failed - Space');
      } else {
        successHandler(req, res, result, 'Delete successful - Space');
        logger.info('Space deleted');
      }
    });
  },
);

// Update space by ID
/*space.put(
  '/:id',
  [authenticator, admin, planner, roleChecker, validate],
  (req: Request, res: Response) => {
    const spaceId = req.params.id;
    const updatedSpaceData = {
      name: req.body.name,
      area: req.body.area,
      info: req.body.info,
      personLimit: req.body.personLimit,
      buildingId: req.body.buildingId,
      availableFrom: req.body.availableFrom,
      availableTo: req.body.availableTo,
      classesFrom: req.body.classesFrom,
      classesTo: req.body.classesTo,
      inUse: req.body.inUse || true, // Default to true if not provided
      spaceTypeId: req.body.spaceTypeId,
    };

    db_knex('Space')
      .where('id', spaceId)
      .update(updatedSpaceData)
      .then((rowsAffected) => {
        if (rowsAffected === 1) {
          successHandler(
            req,
            res,
            rowsAffected,
            `Update successful! Count of modified rows: ${rowsAffected}`,
          );
        } else {
          requestErrorHandler(req, res, `Invalid space ID: ${spaceId}`);
        }
      })
      .catch((error) => {
        requestErrorHandler(req, res, `Error updating space: ${error.message}`);
      });
  },
);*/

// Edit a space by ID
space.put(
  '/',
  validateSpacePut, // Validation middleware for editing space
  [authenticator, admin, planner, roleChecker, validate],
  (req: Request, res: Response) => {
    const id = req.body.id;
    const name = req.body.name;
    const area = req.body.area;
    const info = req.body.info;
    const personLimit = req.body.personLimit;
    const buildingId = req.body.buildingId;
    const availableFrom = req.body.availableFrom;
    const availableTo = req.body.availableTo;
    const classesFrom = req.body.classesFrom;
    const classesTo = req.body.classesTo;
    const inUse = req.body.inUse || true; // Default to true if not provided
    const spaceTypeId = req.body.spaceTypeId;

    const sqlUpdate =
      'UPDATE Space SET name = ?, area = ?, info = ?, personLimit = ?, buildingId = ?, availableFrom = ?, availableTo = ?, classesFrom = ?, classesTo = ?, inUse = ?, spaceTypeId = ? WHERE id = ?';

    db.query(
      sqlUpdate,
      [
        name,
        area,
        info,
        personLimit,
        buildingId,
        availableFrom,
        availableTo,
        classesFrom,
        classesTo,
        inUse,
        spaceTypeId,
        id,
      ],
      (err, result) => {
        if (!result) {
          requestErrorHandler(req, res, `${err}: Nothing to update`);
        } else if (err) {
          dbErrorHandler(req, res, err, 'Oops! Update failed - Space');
        } else {
          successHandler(req, res, result, 'Update successful - Space');
          logger.info(`Space ${req.body.name} updated`);
        }
      },
    );
  },
);

export default space;
